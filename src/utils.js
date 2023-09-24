export function getDateKey( d ) {
    return [ d.getFullYear(), d.getMonth() + 1, d.getDate() ].join('-');
}

export function getDateMonthKey( d ) {
    return [ d.getFullYear(), d.getMonth() + 1 ].join('-');
}

export function compareDates( date1, date2 ) {
    let y1 = date1.getFullYear(),
        y2 = date2.getFullYear();
    let m1 = date1.getMonth(),
        m2 = date2.getMonth();
    let d1 = date1.getDate(),
        d2 = date2.getDate();

    if( y1 !== y2 ) {
        return y1 > y2 ? 1 : -1;
    }

    if( m1 !== m2 ) {
        return m1 > m2 ? 1 : -1;
    }

    if( d1 !== d2 ) {
        return d1 > d2 ? 1 : -1;
    }

    return 0;
}
