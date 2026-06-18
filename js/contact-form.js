const CONTACT_EMAIL = 'danielguillamonrico@gmail.com';
const FORM_SUBMIT_URL = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
const MAX_MESSAGE_LENGTH = 500;

function setMessageCounter(messageField, counter) {
    if (!messageField || !counter) return;
    counter.textContent = `${messageField.value.length}/${MAX_MESSAGE_LENGTH}`;
}

function isBlank(value) {
    return !value || value.trim().length === 0;
}

function getFieldErrorElement(field) {
    if (!field || !field.parentElement) return null;
    return field.parentElement.querySelector('.field-error');
}

function showFieldError(field, message) {
    if (field) {
        field.classList.add('field-invalid');
    }

    const errorElement = getFieldErrorElement(field);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }
}

function clearFieldError(field) {
    if (field) {
        field.classList.remove('field-invalid');
    }

    const errorElement = getFieldErrorElement(field);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
    }
}

function validateSubject(subjectField) {
    const value = subjectField.value;

    if (isBlank(value)) {
        showFieldError(subjectField, 'El asunto no puede estar vac\u00edo ni contener solo espacios.');
        return false;
    }

    clearFieldError(subjectField);
    return true;
}

function validateEmail(emailField) {
    const value = emailField.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isBlank(value)) {
        showFieldError(emailField, 'El email no puede estar vac\u00edo ni contener solo espacios.');
        return false;
    }

    if (!emailPattern.test(value.trim())) {
        showFieldError(emailField, 'Introduce un email v\u00e1lido.');
        return false;
    }

    clearFieldError(emailField);
    return true;
}

function validateMessage(messageField) {
    const value = messageField.value;

    if (isBlank(value)) {
        showFieldError(messageField, 'El mensaje no puede estar vac\u00edo ni contener solo espacios.');
        return false;
    }

    if (value.trim().length > MAX_MESSAGE_LENGTH) {
        showFieldError(messageField, `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres.`);
        return false;
    }

    clearFieldError(messageField);
    return true;
}

function initializeContactForm() {
    const form = document.querySelector('#contact-form');
    const emailField = document.querySelector('#sender-email');
    const subjectField = document.querySelector('#subject');
    const messageField = document.querySelector('#message');
    const counter = document.querySelector('#message-counter');

    if (!form || !emailField || !subjectField || !messageField || !counter) {
        return;
    }

    setMessageCounter(messageField, counter);

    emailField.addEventListener('input', () => {
        validateEmail(emailField);
    });

    subjectField.addEventListener('input', () => {
        validateSubject(subjectField);
    });

    messageField.addEventListener('input', () => {
        setMessageCounter(messageField, counter);
        validateMessage(messageField);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const emailValid = validateEmail(emailField);
        const subjectValid = validateSubject(subjectField);
        const messageValid = validateMessage(messageField);

        if (!emailValid || !subjectValid || !messageValid) {
            return;
        }

        const email = emailField.value.trim();
        const subject = subjectField.value.trim();
        const message = messageField.value.trim();

        const formData = new FormData();
        formData.append('email', email);
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('_subject', `Nuevo mensaje de contacto: ${subject} (${email})`);
        formData.append('_autoresponse', 'Gracias por contactarme. En breve te responder\u00e9.');
        formData.append('_template', 'table');

        submitWithFormSubmit(formData)
            .then((result) => {
                if (result && result.success) {
                    showSuccess('Mensaje enviado correctamente. Gracias.');
                    form.reset();
                    setMessageCounter(messageField, counter);
                } else {
                    showError('No se pudo enviar el formulario. Puedes escribir directamente a los correos de contacto.');
                }
            })
            .catch((err) => {
                console.warn('submitWithFormSubmit error', err);
                showError('Error en el env\u00edo. Puedes escribir directamente a los correos de contacto.');
            });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
    initializeContactForm();
}

async function submitWithFormSubmit(formData) {
    try {
        const resp = await fetch(FORM_SUBMIT_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            body: formData
        });

        if (!resp.ok) {
            const data = await resp.json().catch(() => ({}));
            return { success: false, error: data.message || resp.statusText };
        }

        const data = await resp.json().catch(() => null);
        return { success: true, data };
    } catch (e) {
        console.warn('submitWithFormSubmit failed', e);
        return { success: false, error: e.message };
    }
}

function showSuccess(msg) {
    showStatusMessage(msg, 'success', 3000);
}

function showError(msg) {
    showStatusMessage(msg, 'error', 5000);
}

function showStatusMessage(msg, type, duration) {
    const messageBox = getStatusMessageBox();

    if (messageBox) {
        messageBox.textContent = msg;
        messageBox.className = `status-message visible ${type}`;
        messageBox.style.display = 'block';
        clearStatusTimeout();
        statusClearTimer = window.setTimeout(() => hideStatusMessage(), duration);
    } else {
        alert(msg);
    }
}

let statusClearTimer = null;

function clearStatusTimeout() {
    if (statusClearTimer) {
        clearTimeout(statusClearTimer);
        statusClearTimer = null;
    }
}

function hideStatusMessage() {
    const messageBox = getStatusMessageBox();
    if (!messageBox) return;

    messageBox.classList.remove('visible');
    window.setTimeout(() => {
        if (!messageBox.classList.contains('visible')) {
            messageBox.style.display = 'none';
        }
    }, 400);
}

function getStatusMessageBox() {
    return document.querySelector('#contact-status-message');
}
