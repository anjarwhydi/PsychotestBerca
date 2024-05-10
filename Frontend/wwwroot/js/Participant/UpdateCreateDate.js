function UpdateCreateDate(participantId, currentTestId) {
    return new Promise((resolve, reject) => {
        var requestData = {
            Participant_ID: participantId,
            Test_ID: currentTestId,
            CreateDate: ""
        };
        $.ajax({
            type: "PUT",
            url: ApiUrl + "/api/ParticipantAnswer/UpdateCreateDatePerTest",
            data: JSON.stringify(requestData),
            contentType: "application/json",
            success: function (result) {
                resolve(true); // Resolves promise dengan nilai true
            },
            error: function (error) {
                reject(false); // Rejects promise dengan nilai false
            }
        });
    });
}