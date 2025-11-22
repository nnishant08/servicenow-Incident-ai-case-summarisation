var IncidentSummarizerAjax = Class.create();
IncidentSummarizerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getSummary: function() {
        var incSysId = this.getParameter('sysparm_incident_id');
        var util = new IncidentSummarizerUtils();
        return util.generateSummary(incSysId);
    },

    type: 'IncidentSummarizerAjax'
});
