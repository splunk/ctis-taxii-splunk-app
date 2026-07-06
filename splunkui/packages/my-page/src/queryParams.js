export function getUrlQueryParams() {
    return new URLSearchParams(window.location.search);
}

export function shouldUseDebugMode(){
    return getUrlQueryParams().get('debug') !== null;
}

