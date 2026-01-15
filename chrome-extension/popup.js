const API_BASE = "https://client-feedback-enforcer-production.up.railway.app";

document.addEventListener("DOMContentLoaded", async () => {
    const feedbackInput = document.getElementById("feedback-input");
    const projectSelect = document.getElementById("project-select");
    const sendBtn = document.getElementById("send-btn");
    const statusMsg = document.getElementById("status-msg");
    const loginCheckDiv = document.getElementById("login-check");
    const authErrorDiv = document.getElementById("auth-error");

    // Clear badge
    chrome.action.setBadgeText({ text: "" });

    // Load last captured feedback from context menu
    chrome.storage.local.get(["lastCapturedFeedback"], (result) => {
        if (result.lastCapturedFeedback) {
            feedbackInput.value = result.lastCapturedFeedback;
        }
    });

    // 1. Check Auth & Load Projects
    try {
        const authRes = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        if (!authRes.ok) throw new Error("Unauthorized");

        const authData = await authRes.json();
        if (!authData.user) throw new Error("Unauthorized");

        statusMsg.innerText = "Connected as " + authData.user.email;

        // Load Projects
        const projRes = await fetch(`${API_BASE}/api/projects`, { credentials: "include" });
        const projects = await projRes.json();

        projectSelect.innerHTML = projects.length
            ? projects.map(p => `<option value="${p.id}">${p.name}</option>`).join("")
            : '<option value="">No projects found</option>';

    } catch (err) {
        loginCheckDiv.style.display = "none";
        authErrorDiv.style.display = "block";
        return;
    }

    // 2. Handle Send
    sendBtn.addEventListener("click", async () => {
        const text = feedbackInput.value.trim();
        const projectId = projectSelect.value;

        if (!text || !projectId) {
            statusMsg.innerText = "Please provide feedback and select a project.";
            return;
        }

        sendBtn.disabled = true;
        sendBtn.innerText = "Analyzing...";
        statusMsg.innerText = "AI is parsing feedback...";

        try {
            // Step A: Analyze Feedback
            const analyzeRes = await fetch(`${API_BASE}/api/analyze-feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text })
            });

            if (!analyzeRes.ok) throw new Error("Analysis failed");
            const analysis = await analyzeRes.json();

            // Step B: Save to Project
            statusMsg.innerText = "Saving revision...";
            const saveRes = await fetch(`${API_BASE}/api/projects/${projectId}/revisions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    tasks: analysis.tasks,
                    questions: analysis.questions,
                    summary: analysis.summary,
                    rawFeedback: text
                })
            });

            if (saveRes.ok) {
                statusMsg.innerHTML = '<span class="success-icon">✓</span> Revision saved successfully!';
                sendBtn.innerText = "Done!";
                // Clear storage
                chrome.storage.local.remove("lastCapturedFeedback");
                setTimeout(() => window.close(), 1500);
            } else {
                throw new Error("Save failed");
            }

        } catch (err) {
            console.error(err);
            statusMsg.innerText = "Error: " + err.message;
            sendBtn.disabled = false;
            sendBtn.innerText = "Enforce Feedback";
        }
    });
});
