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
    const userManager = React.useMemo(createUserManager, [ props.configuration, props.userManager ]);
    const [ currentUser, setCurrentUser ] = React.useState<null | User>(null);

    // note: We'll only check on page load or reconfiguration.
    // React.useEffect(checkForCode, [ location.href, userManager ]);
    React.useEffect(configureUserManager, [ userManager ]);

    return <OidcProvider value={{
        userManager,
        currentUser,
    }}>
        { props.children }
    </OidcProvider>;

    function createUserManager()
    {
        if (props.userManager)
        {
            return props.userManager;
        }

        if (props.configuration)
        {
            return new UserManager(props.configuration);
        }

        return null;
    }

    function configureUserManager()
    {
        if (! userManager)
        {
            return;
        }

        effect();

        return cleanup;

        async function effect()
        {
            userManager.events.addAccessTokenExpired(accessTokenExpired);
            userManager.events.addAccessTokenExpiring(accessTokenExpiring);
            userManager.events.addSilentRenewError(silentRenewError);
            userManager.events.addUserLoaded(userLoaded);
            userManager.events.addUserSessionChanged(userSessionChanged);
            userManager.events.addUserSignedOut(userSignedOut);
            userManager.events.addUserUnloaded(userUnloaded);

            // note: Code after this represents the "on first run" checks to rediscover or obtain an authorization.
            //       In the future, I could see this being configurable or simply turned into callbacks.

            const currentUri = new Uri(location.href);
            const currentQuery = currentUri.query(true) as any;

            if (currentQuery["code"])
            {
                const callbackUri = currentUri.toString();

                // note: Scrub the code out of browser history to prevent any accidental
                //       re-auths from React redraws or user navigation.
                history.replaceState(history.state, document.title, currentUri.query("").toString());

                return userManager.signinRedirectCallback(callbackUri);
            }

            // note: Necessary because userManager fires its userLoaded event before we can register a listener.
            const rememberedUser = await userManager.getUser();
            if (rememberedUser && ! currentUser)
            {
                return userLoaded(rememberedUser);
            }

            if (! rememberedUser && ! currentUser)
            {
                return userManager.signinRedirect();
            }
        }

        function cleanup()
        {
            if (! userManager)
            {
                return;
            }

            userManager.events.removeAccessTokenExpired(accessTokenExpired);
            userManager.events.removeAccessTokenExpiring(accessTokenExpiring);
            userManager.events.removeSilentRenewError(silentRenewError);
            userManager.events.removeUserLoaded(userLoaded);
            userManager.events.removeUserSessionChanged(userSessionChanged);
            userManager.events.removeUserSignedOut(userSignedOut);
            userManager.events.removeUserUnloaded(userUnloaded);
        }
    }

    // function checkForCode()
    // {
    //     effect();

    //     async function effect()
    //     {
    //         if (! userManager)
    //         {
    //             return;
    //         }

    //         const currentUri = new Uri(location.href);
    //         const currentQuery = currentUri.query(true) as any;

    //         if (! currentQuery["code"])
    //         {
    //             return;
    //         }

    //         const callbackUri = currentUri.toString();

    //         // note: Scrub the code out of browser history to prevent any accidental
    //         //       re-auths from React redraws or user navigation.
    //         history.replaceState(history.state, document.title, currentUri.query("").toString());

    //         await userManager.signinRedirectCallback(callbackUri);
    //     }
    // }

    async function userLoaded(user: User)
    {
        setCurrentUser(user);

        props.userLoaded && await props.userLoaded(createMeta(user));
    }

    async function userSessionChanged()
    {
        props.userSessionChanged && await props.userSessionChanged(createMeta());
    }

    async function userSignedOut()
    {
        props.userSignedOut && await props.userSignedOut(createMeta());
    }

    async function userUnloaded()
    {
        props.userUnloaded && await props.userUnloaded(createMeta());
    }

    async function accessTokenExpired()
    {
        props.accessTokenExpired && await props.accessTokenExpired(createMeta());
    }

    async function accessTokenExpiring()
    {
        props.accessTokenExpiring && await props.accessTokenExpiring(createMeta());
    }

    async function silentRenewError()
    {
        props.silentRenewError && await props.silentRenewError(createMeta());
    }

    function createMeta(user?: User): OidcMeta
    {
        return {
            userManager,
            currentUser: user || currentUser,
        };
    }
}
