import {
    faCheck, faCog, faFilter, faSortDown, faSortUp,
    faTable, faSort, faToggleOff, faToggleOn,
    faTrash, faWindowClose, faTimes, faChevronDown, faChevronRight,
    faTimesCircle, faClock, faCheckCircle, faHdd, faBars, faSearch,
} from '@fortawesome/free-solid-svg-icons';
export const FaIcons = {
    cog: faCog,
    check: faCheck,
    filter: faFilter,
    sortUp: faSortUp,
    sortDown: faSortDown,
    sort: faSort,
    table: faTable,
    toggleOff: faToggleOff,
    toggleOn: faToggleOn,
    trash: faTrash,
    close: faTimes,
    chevronRight: faChevronRight,
    chevronDown: faChevronDown,
    timesCircle: faTimesCircle,
    clockCircle: faClock,
    checkCircle: faCheckCircle,
    hdd: faHdd,
    menu: faBars,
    search: faSearch
}

export class EmbyComponentIcons {
    public getIcons(){
        return FaIcons;
    }
}