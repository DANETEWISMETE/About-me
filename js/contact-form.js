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
        showFieldError(subjectField, 'El asunto no puede estar vacío ni contener solo espacios.');
        return false;
    }
    clearFieldError(subjectField);
    return true;
}

function validateMessage(messageField) {
    const value = messageField.value;
    if (isBlank(value)) {
        showFieldError(messageField, 'El mensaje no puede estar vacío ni contener solo espacios.');
        return false;
    }
    if (value.trim().length > MAX_MESSAGE_LENGTH) {
        showFieldError(messageField, `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres.`);
        return false;
    }
    clearFieldError(messageField);
    return true;
}

function formatMailtoUrl(subject, message) {
    const encodedSubject = encodeURIComponent(subject.trim());
    const encodedBody = encodeURIComponent(message.trim());
    return `mailto:${CONTACT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
}

function initializeContactForm() {
    const form = document.querySelector('#contact-form');
    const subjectField = document.querySelector('#subject');
    const messageField = document.querySelector('#message');
    const counter = document.querySelector('#message-counter');

    if (!form || !subjectField || !messageField || !counter) {
        return;
    }

    setMessageCounter(messageField, counter);

    subjectField.addEventListener('input', () => {
        validateSubject(subjectField);
    });

    messageField.addEventListener('input', () => {
        setMessageCounter(messageField, counter);
        validateMessage(messageField);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const subjectValid = validateSubject(subjectField);
        const messageValid = validateMessage(messageField);

        if (!subjectValid || !messageValid) {
            return;
        }

        const subject = subjectField.value.trim();
        const message = messageField.value.trim();

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('message', message);
        formData.append('_subject', `Nuevo mensaje de contacto: ${subject}`);
        formData.append('_autoresponse', 'Gracias por contactarme. En breve te responderé.');
        formData.append('_template', 'table');

        submitWithFormSubmit(formData).then(result => {
            if (result && result.success) {
                showSuccess('Mensaje enviado correctamente. Gracias.');
                form.reset();
                setMessageCounter(messageField, counter);
                const fallback = document.querySelector('#mailto-fallback');
                if (fallback) {
                    fallback.style.display = 'none';
                }
            } else {
                const mailtoUrl = formatMailtoUrl(subject, message);
                showMailtoFallback(mailtoUrl);
                showError('No se pudo enviar desde el servicio. Usa el enlace de fallback.');
            }
        }).catch(err => {
            console.warn('submitWithFormSubmit error', err);
            const mailtoUrl = formatMailtoUrl(subject, message);
            showMailtoFallback(mailtoUrl);
            showError('Error en el envío. Usa el enlace de fallback.');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
    initializeContactForm();
}

function showMailtoFallback(mailtoUrl) {
    try {
        const container = document.querySelector('#mailto-fallback');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = '';

        const info = document.createElement('p');
        info.textContent = 'Si no se abrió tu cliente de correo, copia este enlace y pégalo en tu cliente o navegador:';
        container.appendChild(info);

        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.textContent = mailtoUrl;
        link.className = 'mailto-link';
        container.appendChild(link);

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.textContent = 'Copiar enlace';
        copyBtn.className = 'mailto-copy-btn';
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(mailtoUrl);
                copyBtn.textContent = 'Copiado';
                setTimeout(() => (copyBtn.textContent = 'Copiar enlace'), 2000);
            } catch (e) {
                console.warn('Clipboard copy failed', e);
                alert('No se pudo copiar automáticamente. Selecciona y copia el enlace manualmente.');
            }
        });
        container.appendChild(copyBtn);
    } catch (e) {
        console.warn('showMailtoFallback failed', e);
    }
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
