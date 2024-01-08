//Handler Precipitation type
export function handlerPrecipType(preciptype: string[] | null) {
    if (preciptype === null) {
        return 'Без осадков'
    } else if (preciptype.includes('snow')) {
        return 'снег'
    } else if (preciptype.includes('rain') || preciptype.includes('freezing rain') || preciptype.includes('ice')) {
        return 'дождь'
    }
}

//Handler that selects icon depending on the condition code
export function handlerConditionIcon(icon: string) {
    let conditionText: string = '';
    switch (icon) {
        case 'clear-night':
        case 'clear-day':
            conditionText = '☀️';
            break;
        case 'fog':
        case 'wind':
        case 'cloudy':
        case 'partly-cloudy-night':
        case 'partly-cloudy-day':
            conditionText = '☁️';
            break;
        case 'rain':
        case 'thunder-rain':
        case 'thunder-showers-day':
        case 'thunder-showers-night':
        case 'showers-day':
        case 'showers-night':
            conditionText = '🌧';
            break;
        case 'snow':
        case 'snow-showers-day':
        case 'snow-showers-night':
            conditionText = '❄️';
            break;
        default:
            conditionText = '';
    }
    return conditionText;
}

//Converting date to ru format. 2023-12-31 -> 31.12.2023
export function changeDateRuFormat(date: string): string {
    const dateSplit: string[] = date.split('-');
    return `${dateSplit[2]}.${dateSplit[1]}.${dateSplit[0]}`;
}