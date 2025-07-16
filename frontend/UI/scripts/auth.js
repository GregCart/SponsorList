class Authenticator {
    constructor() {
        this.user = null;
        this.domain = "sponsorlist.org";
        this.authDomain = "https://auth.sponsorlist.org";
        this.webDomain = "https://www.sponsorlist.org";
    }

    isAuthenticated() {
        return this.user !== null;
    }

    async signIn() {};

    async signOut() {};
}

class CognitoAuthenticator extends Authenticator {
    constructor() {
        super();
        this.cognitoAuthority = "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_qgJUb4SOQ";
        this.cognitoDomain = "https://us-east-2qgjub4soq.auth.us-east-2.amazoncognito.com";
        this.clientId = "3rmliqfj8asqdjit5siitb4jrr";
        this.cognitoAuthConfig = {
            authority: this.cognitoAuthority,
            client_id: this.clientId,
            redirect_uri: this.webDomain,
            response_type: "code",
            scope: "email openid phone",
        };
        this.userManager = new Oidc.UserManager({
            ...this.cognitoAuthConfig,
        });
        // this.userManager.
        // AWS.config.update({
        //     region: 'us-east-2',
        //     credentials: new AWS.CognitoIdentityCredentials({
        //         AccountId: '138351723362', // your AWS account ID
        //         RoleArn: 'arn:aws:iam::138351723362:role/service-role/sponsorlist.org_v1',
        //         IdentityPoolId: 'us-east-2:fadf8d53-931f-459e-906b-d56f3890a66a'
        //     })
        // });
        // AWS.config.credentials.get(function(err) {
        //     if (!err) {
        //         var id = AWS.config.credentials.identityId;
        //     }
        // });
    }

    async isAuthenticated() {
        await this.userManager.signinCallback().then(function(user) {
                this.user = user;
                console.log("Sign-in successful:", user);
            });
        }

    async signIn() {
        try {
            // this.user = await this.signinCallback();
            await this.userManager.signinRedirect();
        } catch (error) {
            console.error("Sign-in failed:", error);
        }
    }

    async signOut() {
        try {
            await this.signoutRedirect();
            this.user = null;
        } catch (error) {
            console.error("Sign-out failed:", error);
        }
    }

    async signInRedirect () {
        window.location.href = `${this.cognitoDomain}/login?client_id=${this.clientId}&response_type=code&scope=email+openid+phone&login_uri=${encodeURIComponent(this.webDomain)}`;
    };

    async signOutRedirect () {
        window.location.href = `${this.cognitoDomain}/logout?client_id=${this.clientId}&logout_uri=${encodeURIComponent(this.webDomain)}`;
    };
}