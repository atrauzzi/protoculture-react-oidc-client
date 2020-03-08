import React from "react";
import Uri from "urijs";
import { UserManager, UserManagerSettings, User } from "oidc-client";


export interface OidcMeta
{
    userManager: null | UserManager;
    currentUser: null | User;
}

export const oidcContext = React.createContext<OidcMeta>({
    userManager: null,
    currentUser: null,
});

export const OidcProvider = oidcContext.Provider;
export const OidcConsumer = oidcContext.Consumer;

export function useOidc()
{
    return React.useContext(oidcContext);
}

interface OidcCommonProps
{
    children?: any;

    accessTokenExpired?(meta: OidcMeta): any;
    accessTokenExpiring?(meta: OidcMeta): any;
    silentRenewError?(meta: OidcMeta): any;
    userLoaded?(meta: OidcMeta): any;
    userSessionChanged?(meta: OidcMeta): any;
    userSignedOut?(meta: OidcMeta): any;
    userUnloaded?(meta: OidcMeta): any;
}

interface OidcConfigurationProps
{
    configuration?: UserManagerSettings;
}

interface OidcInstanceProps
{
    userManager?: UserManager;
}

export type OidcProps = OidcCommonProps & (OidcConfigurationProps & OidcInstanceProps);

export function Oidc(props: OidcProps)
{
    const [ meta, setMeta ] = React.useState<OidcMeta>({
        userManager: props.userManager || null,
        currentUser: null,
    });
    const [ currentLocation ] = React.useState<string>(location.href);

    React.useEffect(configureUserManager, [ props.configuration, props.userManager ]);
    // note: We'll only check on connection reload or connection reconfiguration.
    React.useEffect(checkForCode, [ currentLocation, meta.userManager ]);

    return <OidcProvider value={meta}>
        { props.children }
    </OidcProvider>;

    function configureUserManager()
    {
        effect();

        return cleanup;

        function effect()
        {
            const newUserManager = props.configuration
                ? new UserManager(props.configuration)
                : props.userManager;

            newUserManager.events.addAccessTokenExpired(accessTokenExpired);
            newUserManager.events.addAccessTokenExpiring(accessTokenExpiring);
            newUserManager.events.addSilentRenewError(silentRenewError);
            newUserManager.events.addUserLoaded(userLoaded);
            newUserManager.events.addUserSessionChanged(userSessionChanged);
            newUserManager.events.addUserSignedOut(userSignedOut);
            newUserManager.events.addUserUnloaded(userUnloaded);

            props.configuration && setMeta({
                userManager: newUserManager,
                currentUser: null,
            });
        }

        function cleanup()
        {
            // todo: Consider any potentially necessary cleanup tasks.
        }
    }

    function checkForCode()
    {
        effect();

        async function effect()
        {
            if (! meta.userManager)
            {
                return;
            }

            const uri = new Uri(currentLocation);
            const query = uri.query(true) as any;

            if (! query["code"])
            {
                return;
            }

            await meta.userManager.signinRedirectCallback();

            history.replaceState(history.state, document.title, uri.query("").toString());
        }
    }

    async function updateCurrentUser()
    {
        const currentUser = await meta.userManager?.getUser();

        setMeta({
            ...meta,
            currentUser,
        });
    }

    async function userLoaded()
    {
        await updateCurrentUser();

        props.userLoaded && await props.userLoaded(meta);
    }

    async function userSessionChanged()
    {
        await updateCurrentUser();

        props.userSessionChanged && await props.userSessionChanged(meta);
    }

    async function userSignedOut()
    {
        await updateCurrentUser();

        props.userSignedOut && await props.userSignedOut(meta);
    }

    async function userUnloaded()
    {
        await updateCurrentUser();

        props.userUnloaded && await props.userUnloaded(meta);
    }

    async function accessTokenExpired()
    {
        props.accessTokenExpired && await props.accessTokenExpired(meta);
    }

    async function accessTokenExpiring()
    {
        props.accessTokenExpiring && await props.accessTokenExpiring(meta);
    }

    async function silentRenewError()
    {
        props.silentRenewError && await props.silentRenewError(meta);
    }
}
