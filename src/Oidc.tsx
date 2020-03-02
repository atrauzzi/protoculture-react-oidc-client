import React from "react";
import Uri from "urijs";
import { UserManager, UserManagerSettings, User } from "oidc-client";


interface OidcMeta
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

interface OidcConfigurationProps
{
    children?: any;
    configuration?: UserManagerSettings;
}

interface OidcInstanceProps
{
    children?: any;
    userManager?: UserManager;
}

type OidcProps = OidcConfigurationProps & OidcInstanceProps;

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
            props.configuration && setMeta({
                userManager: new UserManager(props.configuration),
                currentUser: null,
            });

            props.userManager && setMeta({
                userManager: props.userManager,
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

            // note: First we check to see if we have existing user credentials.
            const existingUser = await meta.userManager.getUser();
            if(existingUser)
            {
                setMeta({
                    ...meta,
                    currentUser: existingUser,
                });

                return;
            }

            const uri = new Uri(currentLocation);
            const query = uri.query(true) as any;

            // note: If we don't have a user, check if one is ready for us from a callback.
            if (! query["code"])
            {
                return;
            }

            await meta.userManager.signinRedirectCallback();

            const currentUser = await meta.userManager?.getUser();

            if (! currentUser)
            {
                return;
            }

            history.replaceState(history.state, document.title, uri.query("").toString());

            setMeta({
                ...meta,
                currentUser,
            });
        }
    }
}
