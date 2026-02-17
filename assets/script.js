let allWorks = [];

async function getWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    allWorks = await response.json();
    displayWorks(allWorks);
}

function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    for (const work of works) {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    }
}

async function getCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();
    displayFilters(categories);
}

function displayFilters(categories) {
    const filtersDiv = document.querySelector(".filters");

    // Bouton "Tous"
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("active");
    btnAll.addEventListener("click", () => {
        setActiveButton(btnAll);
        displayWorks(allWorks);
    });
    filtersDiv.appendChild(btnAll);

    // Boutons par catégorie
    for (const category of categories) {
        const btn = document.createElement("button");
        btn.textContent = category.name;
        btn.addEventListener("click", () => {
            setActiveButton(btn);
            const filtered = allWorks.filter(work => work.categoryId === category.id);
            displayWorks(filtered);
        });
        filtersDiv.appendChild(btn);
    }
}

function setActiveButton(activeBtn) {
    document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
    activeBtn.classList.add("active");
}

getWorks();
getCategories();