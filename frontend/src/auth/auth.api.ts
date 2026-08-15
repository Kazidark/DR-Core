import {
    obtenerToken,
} from "./auth.storage";


export async function authFetch(
    input:
        RequestInfo | URL,

    init:
        RequestInit = {},
) {

    const headers =
        new Headers(
            init.headers,
        );


    const token =
        obtenerToken();


    if (token) {

        headers.set(
            "Authorization",
            `Bearer ${token}`,
        );

    }


    return fetch(
        input,
        {
            ...init,
            headers,
        },
    );

}