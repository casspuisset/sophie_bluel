
//fonction de fetch des articles et d'affichage du portfolio
async function initGallery() {
    //fetch des travaux dans le backend
    const worksResponse = await fetch('http://localhost:5678/api/works');
    let works = await worksResponse.json();

    //initialisation du bouton de login de nav
    loginLink();

    //création des filtres
    fetchFilter();

    //affichage des travaux
    createWorks(works);
    if (sessionStorage.getItem("token")?.length !== 143) {
        document.querySelector(".edit_modale").style.display = "none";
        document.getElementById("edition_mode").style.display = "none";
    } else {
        document.querySelector(".edit_modale").style.display = "flex";
        document.querySelector(".filters").style.display = "none";
        document.getElementById("edition_mode").style.display = "flex";

    }
}
//initialisation de la page index
initGallery();

//initialisation du lien vers la page de log
function loginLink() {
    const loginLink = document.getElementById("login_link");

    if (sessionStorage.getItem("token")) {
        console.log("token bien enregistré")
        loginLink.innerText = "logout";
        loginLink.className = "logout";
        loginLink.setAttribute("href", "#")
        disconnect();
    } else {
        loginLink.innerText = "login";
        loginLink.className = "login";
        loginLink.setAttribute("href", "login.html")
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
        //console.log(t);
        let currentlyActive = t.target.innerText;
        console.log(currentlyActive);

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
        document.querySelector(".gallery").innerHTML = "";
        createWorks(piecesOrdonnees);

    });
}

//fonction d'affichage des travaux
function createWorks(works) {
    for (let i = 0; i < works.length; i++) {
        let article = works[i];
        //verification des informations de chaque article pour les futurs filtres :
        console.log("id and name : " + article.id + ' ' + article.title);
        console.log("id user : " + article.userId)
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

const dialog = document.querySelector("dialog"); //fenetre modale
const showButton = document.querySelector("dialog + button"); //bouton d'ouverture de la modale
const addButton = document.getElementById("add_photo_window"); //bouton pour changer la fenêtre de la modale
const previouslyButton = document.getElementById("previously"); //bouton de retour en arrière dans la modale
const formulaireAddPhoto = document.getElementById("add_form"); //formulaire d'ajout de la modale
const closeButton = document.getElementById("closing"); //bouton de fermeture de la modale


//ouvre la modale
showButton.addEventListener("click", () => {
    dialog.showModal();
    showModaleGallery();
});
//passe à l'affichage de la modale editable
addButton.addEventListener("click", () => {
    clearModale();
    addPost();
});

//reviens à l'écran initial de la modale
previouslyButton.addEventListener("click", () => {
    clearModale();
    showModaleGallery();
})

//affiche l'image
function previewImage() {
    const fileInput = document.getElementById('file_input');
    const file = fileInput.files[0];
    if (file === undefined) return;
    const imagePreviewContainer = document.getElementById('previewImageContainer');

    if (file.type.match('image.*')) {
        const reader = new FileReader();

        reader.addEventListener('load', function (event) {
            const imageUrl = event.target.result;
            const image = new Image();

            image.addEventListener('load', function () {
                imagePreviewContainer.innerHTML = ''; // Vider le conteneur au cas où il y aurait déjà des images.
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

//soumet le formulaire au serveur
formulaireAddPhoto.addEventListener("submit", (e) => {
    e.preventDefault();

    //récupération du token pour l'header
    const token = sessionStorage.getItem("token");

    //récupération des informations du formulaire
    const image = document.getElementById("file_input").files[0];
    const title = document.getElementById("add_title").value;
    const categoryName = document.getElementById("add_category").value;
    const categoryId = determineId(categoryName);
    const category = {
        "id": categoryId,
        "name": categoryName
    };
    /*
    console.log(title);
    console.log(category);
    console.log(image);
*/
    //création du formulaire à envoyer
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);
    formData.append("category", category);

    //requête
    fetch('http://localhost:5678/api/works', {
        method: "POST",
        headers: {
            'authorization': `Bearer ${token}`,
        },
        body: formData
    });
})

function determineId(categoryName) {
    if(categoryName === "Objets") {
        return 1;
    } else if(categoryName === "Appartements") {
        return 2;
    } else if(categoryName === "Hotels & restaurant") {
        return 3;
    } else {
        alert("Il y a un problème avec la catégorie sélectionnée")
    };
} 
//fonction pour afficher les images dans la modale
async function showModaleGallery() {
    const worksResponse = await fetch('http://localhost:5678/api/works');
    let works = await worksResponse.json();

    for (let i = 0; i < works.length; i++) {
        let article = works[i];

        let newFigure = document.createElement("figure")
        let imageWork = document.createElement("img");
        let divModaleGallery = document.querySelector(".modale_gallery");

        imageWork.src = article.imageUrl;
        newFigure.appendChild(imageWork);
        divModaleGallery.appendChild(newFigure);

        // note : faut rajouter bouton corbeille
    }
}

//affichage de la partie ajout d'image
async function addPost() {
    // recherche des catégories pour les options du formulaire
    const catergoriesResponse = await fetch('http://localhost:5678/api/categories');
    let categories = await catergoriesResponse.json();
    let category_list = document.getElementById("add_category");
    let previouslyButton = document.getElementById("previously");
    let addForm = document.getElementById("add_form");

    previouslyButton.style.visibility = "visible";
    addForm.style.display = "flex";
    //ajout des catégories dans le formulaire

    for (let i = 0; i < categories.length; i++) {

        let categorie = categories[i];
        console.log(categorie.name)

        let category = document.createElement("option");

        category.innerText = categorie.name;
        category.value = categorie.name;

        category_list.appendChild(category);
    }
}

//fonction pour effacer le contenu de la modale lors des interactions avec les boutons
function clearModale() {
    let divModaleGallery = document.querySelector(".modale_gallery");
    let divFormGallery = document.getElementById("add_form");
    let divCategory = document.getElementById("add_category");
    divModaleGallery.innerHTML = "";
    divCategory.innerHTML = "";
    divFormGallery.style.display = "none";
    previouslyButton.style.visibility = "hidden";
}

//ferme la modale
closeButton.addEventListener("click", () => {
    clearModale();
    dialog.close();
});

/* fin modale */

function disconnect() {
    let disconnectButton = document.querySelector(".logout");
    disconnectButton.addEventListener("click", () => {
        sessionStorage.removeItem("token");
        console.log("done")
        location.reload()
    })
}
previewImage()
