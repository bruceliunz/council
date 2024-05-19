const formReader = (function () {
    async function getInspections(apiToken, formId) {
        return 'hello';
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
                    getFormResponses(formDetails);
                } else {
                    console.error('Error retrieving form details:', response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Request failed:', error);
            }
        });
    };

    function getFormResponses(formDetails, manager) {
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
                    manager.inspections = extractAnswers(data.items, formDetails);
                    //manager.processInspections(inspections);
                } else {
                    console.error('Error retrieving responses:', response.statusText);
                }
            },
            onerror: function (error) {
                console.error('Request failed:', error);
            }
        });
    };

    function extractAnswers(items, formDetails) {
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
    };

    function simplifyDate(dateString) {
        // Assume the date is in ISO format, e.g., "2024-05-19T00:00:00Z"
        return dateString.split('T')[0];
    }

})();


window.formReader = formReader;