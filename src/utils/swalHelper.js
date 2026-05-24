import Swal from 'sweetalert2';

/**
 * SweetAlert2 wrapper that ensures popups render ABOVE all overlays (drawers, modals)
 * Use this instead of Swal.fire() throughout the app
 */
const swalConfig = {
  backdrop: 'rgba(0,0,0,0.7)',
  customClass: {
    container: 'swal-above-drawer',
    popup: 'swal-above-drawer-popup',
  },
  didOpen: () => {
    const container = document.querySelector('.swal2-container');
    if (container) container.style.zIndex = '100000';
  },
};

export const showAlert = (options) => {
  return Swal.fire({
    ...swalConfig,
    ...options,
  });
};

export const showSuccess = (title, text) => {
  return showAlert({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#1A5276',
    confirmButtonText: 'Great!',
  });
};

export const showError = (title, text) => {
  return showAlert({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#1A5276',
  });
};

export const showInfo = (title, text) => {
  return showAlert({
    icon: 'info',
    title,
    text,
    confirmButtonColor: '#1A5276',
  });
};

export default showAlert;
