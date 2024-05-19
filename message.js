const message = {
    async sendPushoverNotification(app_token, user_token, message, url, urlTitle) {
        const pushoverUrl = "https://api.pushover.net/1/messages.json";
        const payload = new URLSearchParams({
            token: app_token,
            user: user_token,
            message: message,
            url: url,
            url_title: urlTitle
        });

        try {
            const response = await fetch(pushoverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });
            const data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error('Error:', error);
        }
    }
};

window.messageManager = message;