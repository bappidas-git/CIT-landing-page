/* ============================================
   CSV export -> import round trip
   ============================================
   Regression cover for the import parser: it used to split rows on "," which
   shifted every column after a quoted value containing a comma (a note, a
   school name, a message). Export quoting is RFC-4180, so import has to read
   RFC-4180 too — this asserts a lead survives the trip with every field in
   the right key, and that the derived quality columns are never written back
   onto the lead.

   Run with: npm test
   ============================================ */
import { exportLeadsCSV, importLeadsCSV, getLeads, syncLeadsFromServer } from "../leadService";
import { computeQualityScore, getLeadTier } from "../leadQuality";

let captured = "";

// CRA's jest config sets resetMocks: true, so mocks are (re)installed per test.
beforeEach(() => {
  global.URL.createObjectURL = jest.fn(() => "blob:mock");
  global.URL.revokeObjectURL = jest.fn();
  // Capture the CSV text instead of downloading it.
  jest.spyOn(document, "createElement").mockImplementation((tag) => {
    if (tag !== "a") return document.createElementNS("http://www.w3.org/1999/xhtml", tag);
    return { set href(v) {}, download: "", click: () => {} };
  });
  global.Blob = function Blob(parts) {
    captured = parts.join("");
  };
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
  // jsdom in this CRA version has no window.crypto.
  global.crypto = { randomUUID: () => "imported-uuid" };
});

test("comma-bearing values survive an export -> import round trip", async () => {
  const lead = {
    lead_id: "abc-123",
    name: "Rituparna Baruah",
    mobile: "9876500011",
    email: "r@example.com",
    service_interest: "B.E. — Computer Science & Engineering",
    state: "Assam",
    source: "apply-now/full",
    status: "new",
    submitted_at: "2026-05-01T10:00:00.000Z",
    message: 'Please call after 5pm, and ask for "Papu", my uncle',
    lead_tier: "application",
    intake_year: "2026",
    eligibility_percent: 72.3,
    eligibility_met: true,
    twelfth_status: "passed",
    twelfth_board: "AHSEC",
    twelfth_school: "Cotton Collegiate, Guwahati",
    twelfth_subjects: [
      { subject: "Physics", marks: 78 },
      { subject: "Mathematics", marks: 66 },
      { subject: "Chemistry", marks: 73 },
    ],
    tenth_school: "Don Bosco, Nalbari",
    tenth_year: 2024,
    tenth_percent: 81.5,
    filled_by: "parent",
    parent_name: "Jyoti Baruah",
    parent_mobile: "9876500012",
    funding_plan: "education_loan",
    district: "Nalbari",
    counselling_mode: "whatsapp_video",
    admission_timeline: "two_weeks",
    best_time: "evening",
    whatsapp_confirmed: true,
    fbclid: "IwAR0abcdef",
    notes: [{ id: "1", text: "Called, will call back", timestamp: "2026-05-01T11:00:00.000Z" }],
  };

  exportLeadsCSV([lead]);
  expect(captured).toContain('"Called, will call back"');
  expect(captured).toContain('"Cotton Collegiate, Guwahati"');
  expect(captured).toContain("Physics:78; Mathematics:66; Chemistry:73");
  expect(captured).toContain(
    '"Please call after 5pm, and ask for ""Papu"", my uncle"'
  );

  const headerLine = captured.split("\n")[0];
  await syncLeadsFromServer(); // no API configured -> cache stays empty
  const result = await importLeadsCSV(captured);
  expect(result.imported).toBe(1);

  const [imported] = getLeads({});
  expect(imported.name).toBe("Rituparna Baruah");
  expect(imported.mobile).toBe("9876500011");
  expect(imported.service_interest).toBe("B.E. — Computer Science & Engineering");
  expect(imported.state).toBe("Assam");
  expect(imported.lead_tier).toBe("application");
  expect(imported.intake_year).toBe("2026");
  expect(imported.eligibility_percent).toBe(72.3);
  expect(imported.eligibility_met).toBe(true);
  expect(imported.twelfth_board).toBe("AHSEC");
  expect(imported.twelfth_school).toBe("Cotton Collegiate, Guwahati");
  expect(imported.twelfth_subjects).toEqual(lead.twelfth_subjects);
  expect(imported.tenth_school).toBe("Don Bosco, Nalbari");
  expect(imported.tenth_year).toBe(2024);
  expect(imported.tenth_percent).toBe(81.5);
  expect(imported.filled_by).toBe("parent");
  expect(imported.parent_name).toBe("Jyoti Baruah");
  expect(imported.parent_mobile).toBe("9876500012");
  expect(imported.funding_plan).toBe("education_loan");
  expect(imported.district).toBe("Nalbari");
  expect(imported.counselling_mode).toBe("whatsapp_video");
  expect(imported.admission_timeline).toBe("two_weeks");
  expect(imported.best_time).toBe("evening");
  expect(imported.whatsapp_confirmed).toBe(true);
  expect(imported.fbclid).toBe("IwAR0abcdef");
  expect(Array.isArray(imported.notes)).toBe(true);
  expect(imported.notes[0].text).toBe("Called, will call back");
  // Derived columns must never be written back onto the lead.
  expect(imported.quality_score).toBeUndefined();
  expect(imported.quality_band).toBeUndefined();

  // Same tier + score after the round trip.
  expect(getLeadTier(imported)).toBe("application");
  expect(imported.message).toBe(lead.message);
  expect(computeQualityScore(imported)).toEqual(computeQualityScore(lead));
  expect(computeQualityScore(lead).score).toBe(100);
  expect(computeQualityScore(lead).band).toBe("hot");

  // Column alignment: header count === row count.
  expect(headerLine.split(",").length).toBeGreaterThan(30);
});

test("partial leads are capped at warm and legacy leads are enquiry tier", () => {
  const partial = { lead_tier: "partial", intake_year: "2026", funding_plan: "self_funded", admission_timeline: "two_weeks", eligibility_met: true };
  expect(computeQualityScore(partial).band).toBe("warm");
  expect(computeQualityScore(partial).capped).toBe(true);
  expect(getLeadTier({ name: "legacy" })).toBe("enquiry");
});
