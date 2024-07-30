

//script d'identification utilisateur
function userIdentification() {

    const identificationForm = document.querySelector(".identificationForm");
    identificationForm.addEventListener("submit", (e) => {
        //commande pour éviter la recherge de la page à la validation du formulaire
        e.preventDefault();

        //récupération des informations d'identification
        const identificationFormDatas = {
            userEmail: document.getElementById("email"),
            userPassword: document.getElementById("password"),
        };

        //appel de la fonction fetch avec les information d'identification
        fetch("http://localhost:5678/api/users/login", {
            //envoie de l'identification au serveur
            method: "POST",

            //définition du format de la charge utile
            headers: { "Content-Type": "application/json" },

            //passage dans le body de la requête du mot de passe et de l'adresse email du formulaire, convertis en chaine de caractère JSON
            body: JSON.stringify({
                email: identificationFormDatas.userEmail.value,
                password: identificationFormDatas.userPassword.value,
            }),
        }).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    //enregistrement du token pour la session de navigation
                    sessionStorage.setItem("token", data.token);
                    //redirection vers la page principale
                    window.location.replace("index.html");

                    console.log("Authentification réussi")
                });
            } else if (response.status === 401) {
                alert("Mot de passe non reconnu")
                console.log("error 401 - Mot de passe refusé")
            } else if (response.status === 404) {
                alert("L'utilisateur n'a pas été reconnu. Veuillez vérifier l'adresse email employée'")
                console.log("error 404 - Adresse mail non-reconnue par le serveur")
            } else {
                alert("Une erreur inconnue est survenue");
                console.log(error.status)
            }
        });
    });

}

userIdentification()