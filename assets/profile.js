(function () {

const API =
"https://script.google.com/macros/s/AKfycbyrRcZRt7bYAHXWbe6u0kt9ycWsY1sODJDF1g3NDxeqILLt2_prDkrxmH-xmEP7EfuTdQ/exec";

document.getElementById("app").innerHTML = `
<div class="window">
    <div class="profile">

        <a class="win95-btn" href="../" style="margin-top:0; margin-bottom:16px;">
            ← Back to Home
        </a>

        <div class="username" id="username">Loading...</div>
        <div class="account-index" id="account-index"></div>

        <div class="bio-label">Bio:</div>
        <div class="bio" id="bio">Loading...</div>

        <a class="win95-btn" href="https://forms.gle/e7aigQvr7rMyM5CG7" target="_blank" rel="noopener">
            Send DM
        </a>

        <a class="win95-btn" href="https://forms.gle/DKuaqD97SvTR264u6" target="_blank" rel="noopener">
            Follow
        </a>

        <div class="signin-area">
            <label class="password-label" for="dm-password">View your DMs and notifications (password required):</label>
            <div class="password-row">
                <input class="win95-input" type="password" id="dm-password" placeholder="Password">
                <button class="win95-btn" id="dm-unlock" style="margin-top:0;">Unlock</button>
            </div>
            <div class="inbox" id="inbox" style="display:none;">
                <div class="inbox-label">Your DMs:</div>
                <div id="dm-list"></div>
            </div>

            <div class="newest" id="newest" style="display:none;">
                <div class="newest-label">Notifications:</div>
                <div id="newest-list"></div>
            </div>

            <div class="inbox-status" id="inbox-status"></div>
        </div>

    </div>
</div>
`;

function accountUrl(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
}

function accountLink(name) {
    return `<a class="account-link" href="https://moonlightoctopus.github.io/Get/accounts/${accountUrl(name)}.html">${name}</a>`;
}

function currentSlug() {
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf("/") + 1);
    return file.replace(/\.html?$/i, "").toLowerCase();
}

const slug = currentSlug();
let accountName = null;

document.getElementById("dm-unlock").addEventListener("click", unlockDms);
document.getElementById("dm-password").addEventListener("keydown", function (e) {
    if (e.key === "Enter") unlockDms();
});

function unlockDms() {

    const statusEl = document.getElementById("inbox-status");
    const passwordEl = document.getElementById("dm-password");
    const password = passwordEl.value;

    if (!accountName) {
        statusEl.textContent = "Profile not loaded yet.";
        return;
    }

    if (!password) {
        statusEl.textContent = "Enter your password first.";
        return;
    }

    statusEl.textContent = "Checking...";

    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
            type: "dms",
            username: accountName,
            password: password
        })
    })

    .then(res => res.json())

    .then(data => {

        if (data.error) {
            statusEl.textContent = data.error;
            return;
        }

        statusEl.textContent = "";
        passwordEl.value = "";

        const inboxEl = document.getElementById("inbox");
        const listEl = document.getElementById("dm-list");

        if (data.dms.length === 0) {
            listEl.innerHTML = "<div class='dm'>No messages yet.</div>";
        } else {
            listEl.innerHTML = data.dms.map(dm => `
                <div class="dm">
                    <div class="dm-meta">
                        ${accountLink(dm.from)}
                        <span class="dm-time">${new Date(dm.timestamp).toLocaleString()}</span>
                    </div>
                    ${dm.message}
                </div>
            `).join("");
        }

        inboxEl.style.display = "block";

        const newestEl = document.getElementById("newest");
        const newestListEl = document.getElementById("newest-list");
        const newest = data.newest || [];

        if (newest.length === 0) {
            newestListEl.innerHTML = "<div class='newest-item'>No notifications yet.</div>";
        } else {
            newestListEl.innerHTML = newest.map(item => {
                const prefix = item.kind === "followed_post" ? "" : "Replying to: ";
                return `
                <div class="newest-item">
                    <div class="newest-meta">${accountLink(item.name)} <span style="font-weight:normal;">#${item.id}</span></div>
                    <div class="newest-target">${prefix}${item.targetLabel}</div>
                    <div class="newest-time">${new Date(item.timestamp).toLocaleString()}</div>
                    ${item.body}
                </div>
                `;
            }).join("");
        }

        newestEl.style.display = "block";

    })

    .catch(error => {
        statusEl.textContent = "Failed to load your DMs.";
        console.error(error);
    });

}

fetch(API)

.then(response => response.json())

.then(posts => {

    const account = posts.find(post => accountUrl(post.name) === slug);

    if (account) {
        accountName = account.name;
        document.title = accountName + " - Profile";
        document.getElementById("username").textContent = accountName;
        document.getElementById("bio").textContent = account.bio || "No bio set.";

        const indexEl = document.getElementById("account-index");
        if (account.accountIndex != null) {
            indexEl.textContent = `#${account.accountIndex}`;
        }
    } else {
        document.getElementById("username").textContent = "Unknown account";
        document.getElementById("username").classList.add("error-state");
        document.getElementById("bio").textContent = "No account matches this page's URL.";
    }

})

.catch(error => {
    document.getElementById("username").textContent = "Error";
    document.getElementById("bio").textContent = "Failed to load profile.";
    console.error(error);
});

})();