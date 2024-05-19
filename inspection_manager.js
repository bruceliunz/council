const inspectionManager = (function () {

    let inspectionRecords = {};

    function processInspections(inspections) {
        const currentUrl = window.location.href;
        const targetUrl = "https://onlineservices.aucklandcouncil.govt.nz/councilonline/my-account/inspection/bcinspectionbookingssearch";

        inspections.forEach(inspection => {
            let inspectionData = extractData(inspection);
            const url = createInspectionUrl(inspectionData);
            if (currentUrl.startsWith(targetUrl)) {
                openUrlInNewTab(url);
            } else {
                if (inspectionData.consentNo == getParameterByName('consentNo')) {
                    book(inspectionData)
                }
            }
        });
    };

    function book(inspectionData) {
        var form = $('#simpleBookingForm');
        $('#inspectionType').val(inspectionData.inspection_type);
        $.ajax({
            url: '/councilonline/inspection/simple/appointments',
            type: 'POST',
            data: form.serialize(),
            success: function (response, textStatus, jqXHR) {
                const appointments = response.data.appointments;
                if (appointments !== undefined) {
                    const days = appointments.map(appointment => appointment.day);
                    const found_dates = days.filter(value => inspectionData.desired_dates.includes(value)).join(', ');

                    if (found_dates) {
                        window.messageManager.sendPushoverNotification(
                            inspectionData.consentNo + ': found available days: ' + found_dates,
                            'https://onlineservices.aucklandcouncil.govt.nz/councilonline/inspection/simple?consentNo=' + inspectionData.consentNo,
                            'Booking an inspection at'
                        )
                    }

                }
            }
        });
    };

    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        let results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    function extractData(inspection) {
        let bco = '';
        let inspectionType = '';
        let desiredDates = [];

        for (const key in inspection) {
            if (key.startsWith("BCO")) {
                bco = inspection[key];
            }
            if (key.startsWith("Inspection")) {
                inspectionType = inspection[key].label.split('-')[0].trim();
            }
            if (key.startsWith("Date")) {
                desiredDates.push(inspection[key]);
            }
        }

        return { 'consentNo': 'BCO' + bco, 'inspection_type': inspectionType, 'desired_dates': desiredDates };
    };

    function createInspectionUrl(inspectionData) {
        const queryString = Object.keys(inspectionData)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(inspectionData[key]))
            .join('&');

        return `https://onlineservices.aucklandcouncil.govt.nz/councilonline/inspection/simple?${queryString}`;
    };

    function openUrlInNewTab(url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});


window.inspectionManager = inspectionManager;