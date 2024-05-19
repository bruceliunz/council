const formReader = {
    getInspections(apiToken, formId, manager) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.typeform.com/forms/${formId}`,
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            onload: function (response) {
                if (response.status === 200) {
                    const formDetails = JSON.parse(response.responseText);
                    getFormResponses(formDetails, manager);
                } else {
                    console.error('Error retrieving form details:', response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Request failed:', error);
            }
        });
    },

    getFormResponses(formDetails, manager) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: `https://api.typeform.com/forms/${formId}/responses`,
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            onload: function (response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);
                    inspections = extractAnswers(data.items, formDetails);
                    manager.processInspections(inspections);
                } else {
                    console.error('Error retrieving responses:', response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Request failed:', error);
            }
        });
    },

    extractAnswers(items, formDetails) {
        let answersArray = [];
        const questions = {};

        formDetails.fields.forEach(field => {
            questions[field.id] = field.title;
        });

        items.forEach(item => {
            let answers = {};
            item.answers.forEach(answer => {
                const questionId = answer.field.id;
                let responseValue = answer[answer.type];

                // Simplify date fields
                if (answer.type === 'date') {
                    responseValue = simplifyDate(responseValue);
                }

                answers[questions[questionId]] = responseValue;
            });
            answersArray.push(answers);
        });
        return answersArray;
    }

};


window.formReader = formReader;