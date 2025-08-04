
export function _isValidDate(day, month, year) {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
        return false;
    }
    
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && 
           date.getMonth() === m - 1 && 
           date.getDate() === d;
}

export function _isValidISODate(dateString) {
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return false;
    }
    
    const [year, month, day] = dateString.split('-').map(Number);
    return _isValidDate(day.toString().padStart(2, '0'), 
                       month.toString().padStart(2, '0'), year);
}