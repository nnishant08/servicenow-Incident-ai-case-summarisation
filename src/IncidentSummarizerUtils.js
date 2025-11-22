var IncidentSummarizerUtils = Class.create();
IncidentSummarizerUtils.prototype = {
    initialize: function() {},

    generateSummary: function(incidentSysId) {
        if (!incidentSysId)
            return "No Incident Sys ID provided.";

        var inc = new GlideRecord('incident');
        if (!inc.get(incidentSysId))
            return "Incident not found.";

        // --- Collect core fields ---
        var payload = {};
        payload.number = inc.getDisplayValue('number');
        payload.short_description = inc.getValue('short_description');
        payload.description = inc.getValue('description');
        payload.priority = inc.getDisplayValue('priority');
        payload.impact = inc.getDisplayValue('impact');
        payload.urgency = inc.getDisplayValue('urgency');
        payload.state = inc.getDisplayValue('state');
        payload.assignment_group = inc.getDisplayValue('assignment_group');
        payload.assigned_to = inc.getDisplayValue('assigned_to');
        payload.cmdb_ci = inc.getDisplayValue('cmdb_ci');
        payload.opened_at = inc.getDisplayValue('opened_at');
        payload.caller = inc.getDisplayValue('caller_id');

        // --- Collect comments & work notes ---
        payload.comments = [];
        payload.work_notes = [];

        var journal = new GlideRecord('sys_journal_field');
        journal.addQuery('element_id', incidentSysId);
        journal.orderBy('sys_created_on');
        journal.query();

        while (journal.next()) {
            var element = journal.getValue('element');
            var value = journal.getValue('value');

            if (!value)
                continue;

            if (element == 'comments') {
                payload.comments.push({
                    created_on: journal.getDisplayValue('sys_created_on'),
                    created_by: journal.getDisplayValue('sys_created_by'),
                    text: value
                });
            }

            if (element == 'work_notes') {
                payload.work_notes.push({
                    created_on: journal.getDisplayValue('sys_created_on'),
                    created_by: journal.getDisplayValue('sys_created_by'),
                    text: value
                });
            }
        }

        // --- Build the prompt (this is what was missing) ---
        var prompt =
            "You are an IT Service Management incident summarisation assistant.\n\n" +
            "Summarise the following ServiceNow incident for L2/L3 engineers and managers.\n" +
            "Output MUST be in the following structure:\n\n" +
            "1. Overview – one or two sentences on what the issue is and business impact.\n" +
            "2. Affected Service / CI\n" +
            "3. Priority & Current Status\n" +
            "4. Timeline of Actions – bullet list, chronological, derived from work notes and comments.\n" +
            "5. Pending Actions / Blockers\n" +
            "6. Recommendations – short, actionable points (problem candidate, monitoring, follow-ups).\n\n" +
            "Keep it concise, avoid repeating raw log text, and do NOT invent details.\n\n" +
            "Here is the incident data in JSON format:\n\n" +
            JSON.stringify(payload, null, 2);

        // --- Build OpenAI-style request body (tweak to match your REST profile) ---
        var requestBody = {
            model: "gpt-4.1-mini",    // <- change to your configured model if needed
            messages: [
                {
                    role: "system",
                    content: "You are a highly skilled ServiceNow incident summarisation assistant."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 400
        };

        try {
            // This assumes you already have a REST Message defined
            // e.g. Name: 'OpenAI.ChatCompletion', HTTP Method: 'default'
            var rm = new sn_ws.RESTMessageV2('OpenAI - Chat Completions', 'POST - Chat');
            rm.setRequestBody(JSON.stringify(requestBody));
            var response = rm.execute();
            var body = response.getBody();

            var parsed = JSON.parse(body);
            var summary = parsed.choices &&
                          parsed.choices[0] &&
                          parsed.choices[0].message &&
                          parsed.choices[0].message.content;

            if (!summary)
                return "Model did not return a summary. Raw response: " + body;
// 1) Put a blank line before each numbered section (1., 2., 3., etc.)
summary = summary.replace(/(\d\.\s)/g, "\n\n$1");

// 2) Collapse multiple spaces to single spaces (so we don't rely on them for spacing)
summary = summary.replace(/ {2,}/g, " ");

// 3) Make sure any existing '\n' from the model are normal newlines (leave them as-is)

// IMPORTANT: do NOT add any <br/> tags here
return summary;

        } catch (e) {
            gs.error("IncidentSummarizerUtils.generateSummary error: " + e.message);
            return "Error while generating summary: " + e.message;
        }
    },

    type: 'IncidentSummarizerUtils'
};
