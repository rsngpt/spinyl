export function formatFriendlyDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
}

export function formatFriendlyTime(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) return '';
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function formatLongDate(dateInput: string | Date): string {
    const dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}

