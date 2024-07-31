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
    const worksResponse = await fetch('http://localhost:5678/api/works');
    let works = await worksResponse.json();

    //ouvre la modale
    const dialog = document.querySelector("dialog"); //fenetre modale
    const showButton = document.querySelector(".edit_modale"); //bouton d'ouverture de la modale    
    showButton.addEventListener("click", () => {
        dialog.showModal();
        clearModale();
        showModaleGallery(works);
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

    //fonction de retour à la galerie de la modale
    const previouslyButton = document.getElementById("previously"); //bouton de retour en arrière dans la modale
    previouslyButton.addEventListener("click", () => {
        clearModale();
        showModaleGallery(works);
    })

    //ferme la modale
    const closeButton = document.getElementById("closing"); //bouton de fermeture de la modale
    closeButton.addEventListener("click", () => {
        clearModale();
        dialog.close();
    });
};
modale();
//fonction globale de la modale




//affiche l'image
function previewImage() {
    const fileInput = document.getElementById('file_input');
    const file = fileInput.files[0];
    if (file === undefined) { return };
    const imagePreviewContainer = document.getElementById('previewImageContainer');

    if (file.type.match('image.*')) {
        const reader = new FileReader();

        reader.addEventListener('load', function (event) {
            const imageUrl = event.target.result;
            const image = new Image();

            image.addEventListener('load', function () {
                imagePreviewContainer.innerHTML = ''; // Vider le conteneur au cas où il y aurait déjà des images
                imagePreviewContainer.appendChild(image);
            });

            image.src = imageUrl;
            image.id = "new_photo";
            image.style.width = '200px';
            image.style.height = 'auto'
        });

        reader.readAsDataURL(file);
    }
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
async function showModaleGallery(works) {

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

    previouslyButton.style.visibility = "visible";
    addForm.style.display = "flex";
}

//fonction pour effacer le contenu de la modale lors des interactions avec les boutons
function clearModale() {
    let divModaleGallery = document.querySelector(".modale_gallery");
    let divFormGallery = document.getElementById("add_form");
    //let divCategory = document.getElementById("add_category");
    divModaleGallery.innerHTML = "";
    //divCategory.style.display = "none";
    divFormGallery.style.display = "none";
    previouslyButton.style.visibility = "hidden";
}


//reviens à l'écran initial de la modale
const previouslyButton = document.getElementById("previously"); //bouton de retour en arrière dans la modale
previouslyButton.addEventListener("click", () => {
    clearModale();
    showModaleGallery();
})

//fonction de fetch POST
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
    });
}

//supprime les éléments dans le serveur
async function deletePost(i, works) {
    const token = sessionStorage.getItem("token");
    let deleteUrl = 'http://localhost:5678/api/works/'+i;

    await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
            'authorization': `Bearer ${token}`,
        },
    }).then(async (response) => {
        if(response===200) {
            alert("La photo a bien été supprimée");
            reloadDelete(i, works)
        } else if(response===401) {
            alert("Vous n'avez pas l'autorisation pour supprimer cette photo")
        } else {
            alert("Echec dans la suppression")
        }
    })
}

async function reloadDelete(i, works) {

    let newArray = Array.from(works);
    newArray = newArray.filter((work) => work.id !== i);
    createWorks(newArray);
    clearModale();
    showModaleGallery(newArray)   
}

/* fin modale */

function disconnect() {
    let disconnectButton = document.querySelector(".logout");
    disconnectButton.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        console.log("disconnected")
        location.reload()
    })
}
