//fonction de fetch des articles et d'affichage du portfolio
async function initGallery() {
    //fetch des travaux dans le backend
    const worksResponse = await fetch('http://localhost:5678/api/works');
    let works = await worksResponse.json();

    //adaptation de la page à la présence du token
    loginLink();

    //affichage des travaux
    createWorks(works);

}

//initialisation de la page index
initGallery();

//vérification du token et affichage de la page
function loginLink() {
    const loginLink = document.getElementById("login_link");
    const editModale = document.querySelector(".edit_modale");
    const filters = document.querySelector(".filters");
    const editionMode = document.getElementById("edition_mode");

    if (sessionStorage.getItem("token")) {
        loginLink.innerText = "logout";
        loginLink.className = "logout";
        loginLink.setAttribute("href", "#")
        editModale.style.display = "flex";
        filters.style.display = "none";
        editionMode.style.display = "flex";
        disconnect();
    } else {
        loginLink.innerText = "login";
        loginLink.className = "login";
        loginLink.setAttribute("href", "login.html")
        editModale.style.display = "none";
        editModale.style.display = "none";
        //création des filtres
        fetchFilter();
    }
}

//fonction de fetch des catégories de filtres
async function fetchFilter() {
    //fetch les catégories dans le backend
    const catergoriesResponse = await fetch('http://localhost:5678/api/categories')
    let categories = await catergoriesResponse.json();

    //crée les boutons de filtre via la fonction createFilters
    createFilters(categories);
}

//fonction de création des boutons de filtres
function createFilters(categories) {
    //définie le container
    const divFilter = document.querySelector(".filters");

    //crée l'élément de bouton
    const buttonFilter = document.createElement("button");
    //donne les caractéristiques du bouton "TOUS"
    buttonFilter.innerText = "Tous";
    buttonFilter.className = "filterButton";
    //lie le bouton TOUS au DOM
    divFilter.appendChild(buttonFilter);

    //boucle de création des autres boutons
    for (let i = 0; i < categories.length; i++) {
        let categorie = categories[i];
        const buttonFilter = document.createElement("button");
        buttonFilter.innerText = categorie.name;
        buttonFilter.className = "filterButton";
        divFilter.appendChild(buttonFilter);
    }
    galleryFilter()
}

//fonction de définition du filtre
async function galleryFilter() {

    const clickFilterEvent = document.querySelector('.filters');
    clickFilterEvent.addEventListener("click", async (t) => {
        let currentlyActive = t.target.innerText;

        const worksResponse = await fetch('http://localhost:5678/api/works');
        let works = await worksResponse.json();

        let newArray = Array.from(works);
        if (currentlyActive === "Tous") {
            piecesOrdonnees = newArray
        }
        else {
            piecesOrdonnees = newArray.filter((work) => work.category.name === currentlyActive)
        }

        // Effacement et recréation de la gallerie
        createWorks(piecesOrdonnees);

    });
}

//fonction d'affichage des travaux
function createWorks(works) {
    document.querySelector(".gallery").innerHTML = "";
    for (let i = 0; i < works.length; i++) {
        let article = works[i];
        //création des balises
        let newFigure = document.createElement("figure")
        let imageWork = document.createElement("img");
        let nameWork = document.createElement("figcaption");

        //attribution des caractéristiques de chaque article
        imageWork.src = article.imageUrl;
        nameWork.innerText = article.title;

        //rattachement des balises entre elles
        newFigure.appendChild(imageWork);
        newFigure.appendChild(nameWork);

        //rattachement des balises au DOM
        let divGallery = document.querySelector(".gallery");
        divGallery.appendChild(newFigure);
    }
}


/**
 * Modale
*/
async function modale() {


    //ouvre la modale
    const dialog = document.querySelector("dialog"); //fenetre modale
    const showButton = document.querySelector(".edit_modale"); //bouton d'ouverture de la modale    
    showButton.addEventListener("click", () => {
        dialog.showModal();
        clearModale();
        showModaleGallery();
        
        //vérification de l'état du nav de la modale
        let submitButton = document.getElementById("submit_form");
        let nextButton = document.getElementById("add_photo_window");
        submitButton.style.display = "none";
        nextButton.style.display = "block";
    })

    //passe à l'affichage de la modale editable
    const addButton = document.getElementById("add_photo_window"); //bouton pour changer la fenêtre de la modale
    addButton.addEventListener("click", () => {
        clearModale();
        addPost();
    });

    //soumet le formulaire au serveur
    const formulaireAddPhoto = document.getElementById("add_form"); //formulaire d'ajout de la modale
    formulaireAddPhoto.addEventListener("submit", (e) => {
        e.preventDefault();
        clearModale();
        postNewImage();
    });

    //ferme la modale
    const closeButton = document.getElementById("closing"); //bouton de fermeture de la modale
    closeButton.addEventListener("click", () => {
        clearModale();
        dialog.close();
    });

    dialog.addEventListener("click", (e) => {
        var obj = document.querySelector(".modale_wrapper")
        if(!obj.contains(e.target)){
            clearModale();
            dialog.close();
        }
    })
};
modale();
//fonction globale de la modale




//affiche l'image
function previewImage() {
    const fileInput = document.getElementById('file_input');
    const file = fileInput.files[0];

    if (file === undefined) {
        return
    };

    const imagePreviewContainer = document.getElementById('preview_image_container');

    if (file.type.match('image.*')) {
        const reader = new FileReader();

        reader.addEventListener('load', (e) => {
            const imageUrl = e.target.result;
            const image = new Image();

            image.addEventListener('load', () => {
                imagePreviewContainer.innerHTML = '';
                imagePreviewContainer.appendChild(image);
            });

            image.src = imageUrl;
            image.id = "new_photo";
            image.style.width = '200px';
            image.style.height = 'auto'
        });

        reader.readAsDataURL(file);
        let containerImage = document.getElementById("choose_new_photo");
        let submitButton = document.getElementById("submit_form");
        containerImage.style.display = "none";
        submitButton.style.backgroundColor = "#1D6154";
        submitButton.style.borderColor = "#1D6154";
    }
}

function cleanPreviewImage() {
    const imagePreviewContainer = document.getElementById('preview_image_container');
    imagePreviewContainer.innerHTML = '';
}

//determine l'id de catégorie à envoyer via la requête POST
function determineId(categoryName) {
    if (categoryName === "Objets") {
        return 1;
    } else if (categoryName === "Appartements") {
        return 2;
    } else if (categoryName === "Hotels & restaurant") {
        return 3;
    } else {
        alert("Veuillez sélectionner une catégorie")
    };
}

//fonction pour afficher les images dans la modale et crée les boutons poubelle
async function showModaleGallery() {
    const worksResponse = await fetch('http://localhost:5678/api/works');
    let works = await worksResponse.json();
    clearModale();
    for (let i = 0; i < works.length; i++) {
        let article = works[i];
        let newFigure = document.createElement("figure");
        let imageWork = document.createElement("img");
        let trashCan = document.createElement("i");
        let divModaleGallery = document.querySelector(".modale_gallery");

        trashCan.className = "fa-solid fa-trash-can";
        trashCan.id = i;//id du bouton associé à l'id de l'élément

        imageWork.src = article.imageUrl;

        newFigure.appendChild(imageWork);
        newFigure.appendChild(trashCan);
        divModaleGallery.appendChild(newFigure);
        trashCan.addEventListener("click", async () => {
            deletePost(i, works)
        });
    }
}

//affichage de la partie ajout d'image
async function addPost() {
    let previouslyButton = document.getElementById("previously");
    let addForm = document.getElementById("add_form");
    let submitButton = document.getElementById("submit_form");
    let nextButton = document.getElementById("add_photo_window");

    previouslyButton.style.visibility = "visible";
    addForm.style.display = "flex";
    submitButton.style.display = "flex";
    nextButton.style.display = "none";
    console.log("addPost appelé")
    previouslyButton.addEventListener("click", function previouslyButton() {
        clearModale();
        submitButton.style.display = "none";
        nextButton.style.display = "block";
        showModaleGallery();
        this.removeEventListener('click', previouslyButton)
    })
}

//fonction pour effacer le contenu de la modale lors des interactions avec les boutons
function clearModale() {
    let previouslyButton = document.getElementById('previously')
    let divModaleGallery = document.querySelector(".modale_gallery");
    let divFormGallery = document.getElementById("add_form");
    let imagePreviewContainer = document.getElementById('preview_image_container');
    let chooseNewPhoto = document.getElementById("choose_new_photo");
    let submitButton = document.getElementById("submit_form");

    submitButton.style.backgroundColor = "#A7A7A7";
    submitButton.style.borderColor = "#A7A7A7";
    divModaleGallery.innerHTML = "";
    divFormGallery.style.display = "none";
    previouslyButton.style.visibility = "hidden";
    imagePreviewContainer.innerHTML = '';
    chooseNewPhoto.style.display = "flex";

}

//fonction d'envoi du formulaire de création d'image
async function postNewImage() {
    //récupération du token pour l'header
    const token = sessionStorage.getItem("token");
    //récupération des informations du formulaire
    const image = document.getElementById("file_input").files[0];
    const title = document.getElementById("add_title").value;
    const categoryName = document.getElementById("add_category").value;

    //création du formulaire à envoyer
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", determineId(categoryName));

    //requête
    fetch('http://localhost:5678/api/works', {
        method: "POST",
        headers: {
            'authorization': `Bearer ${token}`,
        },
        body: formData,
    }).then((response) => {
        if (response.status === 201) {
            return response.json();
        } else if (response.status === 400) {
            alert("Il y a une erreur avec les informations envoyées");
        } else if (response.status === 401) {
            alert("Vous n'êtes pas autorisé à poster de nouvelles images");
        } else {
            alert("Une erreur inconnue est survenue")
        }
    }
    ).then((response) => {
        changeWithPost();
    }).catch((error) => { throw (error) });
}

//supprime les éléments dans le serveur
async function deletePost(i, works) {
    const token = sessionStorage.getItem("token");
    let deleteUrl = 'http://localhost:5678/api/works/' + works[i].id;

    await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
            'authorization': `Bearer ${token}`,
        },
    }).then(async (response) => {
        if (response.status === 204) {
            console.log("picture deleted")
        } else if (response.status === 401) {
            alert("Vous n'avez pas l'autorisation pour supprimer cette photo")
        } else if (response.status === 500) {
            alert("Echec dans la suppression")
        } else {
            alert(response.status)
        }
    }).then(
        changeWithPost()
    ).catch((error) => { throw (error) })
}

//raffraichis la page après l'ajout ou la suppression d'une photo
async function changeWithPost() {
    const worksResponse = await fetch('http://localhost:5678/api/works');
    let works = await worksResponse.json();

    //let addForm = document.getElementById("add_form");
    let submitButton = document.getElementById("submit_form");
    let nextButton = document.getElementById("add_photo_window");

    //addForm.style.display = "block";
    submitButton.style.display = "none";
    nextButton.style.display = "block";

    clearModale();
    createWorks(works);
    showModaleGallery();
}

//fonction pour fermer la modale en cas de click en dehors
function closeOnClickOutside() {
    document.addEventListener("click", function(event) {
        var dialog = document.querySelector("dialog");
        if (!dialog.contains(event.target)) {
            clearModale();
            dialog.close();
        }
    });
}

//fonction pour la déconnection de l'utilisateur
function disconnect() {
    let disconnectButton = document.querySelector(".logout");
    disconnectButton.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        console.log("disconnected")
        location.reload()
    })
}
