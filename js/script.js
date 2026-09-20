
const API_URL = "http://127.0.0.1:8000";

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const message =
            document.getElementById("registerMessage");


        message.textContent = "Creating your account...";


        try {

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.detail || "Registration failed.";

                return;
            }


            message.textContent =
                "Registration successful!";


            setTimeout(function () {

                window.location.href = "login.html";

            }, 1000);


        } catch (error) {

            console.error("Register error:", error);

            message.textContent =
                "Could not connect to the server.";

        }

    });

}


const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const username = document
            .getElementById("username")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const message =
            document.getElementById("loginMessage");


        message.textContent = "Logging in...";


        try {

            const formData = new URLSearchParams();

            formData.append("username", username);
            formData.append("password", password);


            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded"
                    },

                    body: formData
                }
            );


            const data = await response.json();


            if (!response.ok) {

                message.textContent =
                    data.detail || "Login failed.";

                return;
            }


            // Save JWT token
            localStorage.setItem(
                "access_token",
                data.access_token
            );


            message.textContent =
                "Login successful!";


            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 500);


        } catch (error) {

            console.error("Login error:", error);

            message.textContent =
                "Could not connect to the server.";

        }

    });

}


const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        localStorage.removeItem("access_token");

        window.location.href = "login.html";

    });

}


const tripForm =
    document.getElementById("tripForm");


if (tripForm) {

    tripForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const destination = document
            .getElementById("destination")
            .value
            .trim();

        const days = Number(
            document
                .getElementById("days")
                .value
        );

        const interests = document
            .getElementById("interests")
            .value
            .trim();


        const message =
            document.getElementById("tripMessage");

        const result =
            document.getElementById("tripResult");


        const token =
            localStorage.getItem("access_token");


        // User is not logged in
        if (!token) {

            window.location.href = "login.html";

            return;
        }


        message.textContent =
            "Generating your trip plan...";

        result.innerHTML = "";


        try {

            const response = await fetch(
                `${API_URL}/trips/plan`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        destination: destination,
                        days: days,
                        interests: interests
                    })
                }
            );


            const data =
                await response.json();


            // Token expired / invalid
            if (response.status === 401) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";

                return;
            }


            if (!response.ok) {

                message.textContent =
                    data.detail ||
                    "Failed to generate trip.";

                return;
            }


            message.textContent =
                "Trip generated successfully!";


           const plan = data.generated_plan;

let daysHTML = "";

plan.days.forEach(function (day) {

    daysHTML += `
        <div class="generated-day">

            <h3>
                Day ${day.day} — ${day.title}
            </h3>

            <h4>Activities</h4>

            <ul>
                ${day.activities
                    .map(function (activity) {
                        return `<li>${activity}</li>`;
                    })
                    .join("")}
            </ul>


            <h4>Food</h4>

            <ul>
                ${day.food
                    .map(function (food) {
                        return `<li>${food}</li>`;
                    })
                    .join("")}
            </ul>


            <h4>Tips</h4>

            <ul>
                ${day.tips
                    .map(function (tip) {
                        return `<li>${tip}</li>`;
                    })
                    .join("")}
            </ul>

        </div>
    `;

});


result.innerHTML = `

    <h2>${data.destination}</h2>

    <p>
        <strong>Days:</strong>
        ${data.days}
    </p>

    <p>
        <strong>Interests:</strong>
        ${data.interests}
    </p>

    <hr>

    <div class="trip-summary">

        <h3>Trip Summary</h3>

        <p>
            ${plan.summary}
        </p>

    </div>

    <hr>

    <div class="generated-plan">

        ${daysHTML}

    </div>

`; 


        } catch (error) {

            console.error(
                "Create trip error:",
                error
            );

            message.textContent =
                "Could not connect to the server.";

        }

    });

}

const tripsContainer =
    document.getElementById("tripsContainer");


if (tripsContainer) {

    const token =
        localStorage.getItem("access_token");


    // User is not logged in
    if (!token) {

        window.location.href = "login.html";

    } else {

        async function loadTrips() {

            try {

                const response = await fetch(
                    `${API_URL}/trips/`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


                const trips =
                    await response.json();


                // Token expired / invalid
                if (response.status === 401) {

                    localStorage.removeItem(
                        "access_token"
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                if (!response.ok) {

                    tripsContainer.innerHTML = `

                        <p>
                            ${
                                datail ||
                                "Failed to load trips."
                            }
                        </p>

                    `;

                    return;
                }


                // No trips
                if (trips.length === 0) {

                    tripsContainer.innerHTML = `

                        <p>
                            You haven't created
                            any trips yet.
                        </p>

                    `;

                    return;
                }


                // Clear container
                tripsContainer.innerHTML = "";

                trips.forEach(function (trip) {

                    const tripElement =
                        document.createElement("article");


                    tripElement.className =
                        "trip-history-card";


                    tripElement.innerHTML = `

                        <h2>
                            ${trip.destination}
                        </h2>


                        <div class="trip-summary">

                            <p>
                                <strong>Days:</strong>
                                ${trip.days}
                            </p>

                            <p>
                                <strong>Interests:</strong>
                                ${trip.interests}
                            </p>

                        </div>


                        <div class="trip-details">

                            <p>
                                ${trip.generated_plan}
                            </p>

                        </div>


                        <button
                            class="delete-trip-button"
                            data-trip-id="${trip.id}"
                        >
                            Delete
                        </button>

                    `;


                    tripElement.addEventListener(
                        "click",
                        function () {

                            this.classList.toggle("open");

                        }
                    );

                    const deleteButton =
                        tripElement.querySelector(
                            ".delete-trip-button"
                        );


                    deleteButton.addEventListener(
                        "click",
                        async function (event) {

                            // Prevent card from opening
                            event.stopPropagation();


                            const tripId =
                                this.dataset.tripId;


                            const confirmed =
                                confirm(
                                    "Are you sure you want to delete this trip?"
                                );


                            if (!confirmed) {

                                return;

                            }


                            await deleteTrip(tripId);

                        }
                    );


                    tripsContainer.appendChild(
                        tripElement
                    );

                });

            } catch (error) {

                console.error(
                    "Load trips error:",
                    error
                );


                tripsContainer.innerHTML = `

                    <p>
                        Could not connect
                        to the server.
                    </p>

                `;

            }

        }

        async function deleteTrip(tripId) {

            const token =
                localStorage.getItem("access_token");


            if (!token) {

                window.location.href =
                    "login.html";

                return;
            }


            try {

                const response = await fetch(
                    `${API_URL}/trips/${tripId}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


                const data =
                    await response.json();


                // Token expired / invalid
                if (response.status === 401) {

                    localStorage.removeItem(
                        "access_token"
                    );

                    window.location.href =
                        "login.html";

                    return;
                }


                if (!response.ok) {

                    alert(
                        data.detail ||
                        "Failed to delete trip."
                    );

                    return;
                }


                // Reload trips
                await loadTrips();


            } catch (error) {

                console.error(
                    "Delete trip error:",
                    error
                );


                alert(
                    "Could not connect to the server."
                );

            }

        }

        loadTrips();

    }

}

