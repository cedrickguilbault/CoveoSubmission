//Global values
var resultsPerPage = 12;
var currentPage = 1;
var researchQ = "";




//test if the number is a multiplyer of the amtProw value passed.
function testNumber(n, amtPRow)
{
    var newN = n / amtPRow;
    var result = (newN - Math.floor(newN)) !== 0;


    return result;
}

//Update results per page global value
function updateResultsPerPage() {
    resultsPerPage = document.getElementById("tresultsperpageSelect").value;

    //reload page
    callSearchServices(false);
}


//Build the API link and do the request.
function callSearchServices(urlLoad) {
    //reset page
    document.getElementById("detail").innerHTML = "";



    var firstResult = 0;
    if (currentPage > 1) {
        firstResult = resultsPerPage * (currentPage - 1)
    }
    var contains = document.getElementById("searchBar").value;
    var token = '058c85fd-3c79-42a3-9236-b83d35588103';
    var query = 'https://cloudplatform.coveo.com/rest/search';
    researchQ = "";

    //build Coveo API webservice (query)
    if (urlLoad) {
        //build from URL
        console.log("window.location.hash: " + window.location.hash);

        for (var i = 0; i < window.location.hash.split("&").length; i++) {
            if (window.location.hash.split("&")[i].split("=")[0] == "q") {
                document.getElementById("searchBar").value = decodeURIComponent(window.location.hash.split("&")[i].split("=")[1]);
            } else if (window.location.hash.split("&")[i].split("=")[0] == "numberOfResults") {
                resultsPerPage = window.location.hash.split("&")[i].split("=")[1];
            } else if (window.location.hash.split("&")[i].split("=")[0] == "firstResult") {
                currentPage = window.location.hash.split("&")[i].split("=")[1] / resultsPerPage;
                currentPage = currentPage + 1;
            }
        }


        query = query + '?access_token=' + token + window.location.hash.substring(1, window.location.hash.length);
    } else {
        //Build from values on the page
        if (contains.length > 0) {
            researchQ = '&q=' + encodeURI(contains);
        }
        researchQ = researchQ + '&numberOfResults=' + resultsPerPage;

        researchQ = researchQ + "&firstResult=" + firstResult;

        query = query + '?access_token=' + token + researchQ;

        var advanceFilter = filterServiceBuilder();
        query = query.split("aq=")[0] + advanceFilter;
        researchQ = researchQ + decodeURIComponent(advanceFilter);

        console.log("before:" + window.location.hash);
        //update URL
        window.location.hash = researchQ;
        console.log("after:" + window.location.hash);


    }


    console.log(query);

    var request = new XMLHttpRequest();
    request.open('GET', query, true);
    request.onload = function () {

        // Begin accessing JSON data here
        var data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {

            //Create detail header and detail section.  
            createfilterContainer();
            createDetailHeader(data);
            createDetailDetail(data);

        } else {
            const errorMessage = document.createElement('marquee');
            errorMessage.textContent = `Error: ` + data.message;
            document.getElementById("detail").appendChild(errorMessage);
        }
    }

    request.send();
}

//Build the advance filters in the coveo query
function filterServiceBuilder() {
    //filterLabelValueCB
    //filterValueTo & filterValueFrom
    var filterValueCB = document.getElementsByClassName("filterValueCB");
    var filterLabelValueCB = document.getElementsByClassName("filterLabelValueCB");
    var filterValueTo = document.getElementsByClassName("filterValueTo");
    var filterValueFrom = document.getElementsByClassName("filterValueFrom");
    var queryWfilters = "&aq=";

    var preDataField = null;
    var queryPerDataType = "";

    //loop through all advance filter to see if they are checked then add them to the coveo query
    for (var i = 0; i < filterValueCB.length + 1; i++) {
        //if it's the last value in the loop it will insert the last checked value to the query
        if (i == filterValueCB.length) {
            if (preDataField != null) {
                queryWfilters = queryWfilters + "(%40" + preDataField + "%3D%3D(" + queryPerDataType + "))";
            }
        } else {
            if (filterValueCB[i].checked) {
                if (preDataField != null) {
                    //will validate if the last checked value is the same type as this one
                    if (preDataField == encodeURI(filterValueCB[i].getAttribute("data-field"))) {
                        queryPerDataType = queryPerDataType + ",\"" + encodeURI(filterLabelValueCB[i].innerHTML) + "\"";
                    } else {
                        queryWfilters = queryWfilters + "(%40" + preDataField + "%3D%3D(" + queryPerDataType + "))";
                        queryPerDataType = "\"" + encodeURI(filterLabelValueCB[i].innerHTML) + "\"";
                    }
                } else {
                    //first value to be checked
                    queryPerDataType = "\"" + encodeURI(filterLabelValueCB[i].innerHTML) + "\"";
                }
                //set the last value to have been checked
                preDataField = encodeURI(filterValueCB[i].getAttribute("data-field"));


            }
        }
    }
    //build the price range advance query filter
    if (Number(filterValueTo[0].value) > 0 & Number(filterValueFrom[0].value) > 0) {
        if (Number(filterValueTo[0].value) < Number(filterValueFrom[0].value)) {
            queryWfilters = queryWfilters + "%20(%40" + encodeURI(filterValueTo[0].getAttribute("data-field")) + "%3D%3D(" + encodeURI(filterValueTo[0].value) + ".." + encodeURI(filterValueFrom[0].value) + "))";
        } else {
            queryWfilters = queryWfilters + "%20(%40" + encodeURI(filterValueTo[0].getAttribute("data-field")) + "%3D%3D(" + encodeURI(filterValueFrom[0].value) + ".." + encodeURI(filterValueTo[0].value) + "))";
        }
    }

    return queryWfilters;

}

//create a filter div
function createBoxContainer(Title, checkBoxValues, filterType, fieldType, oldPriceFrom, oldPriceTo) {
    const filterContainerOutterBox = document.createElement('div');
    filterContainerOutterBox.setAttribute("id", "CategoryFilterContainer");
    filterContainerOutterBox.setAttribute("class", "filterContainer");



    if (filterType == "checkBox") {
        //Filter
        //Create Box Container

        //Title Container
        const filterLabelContainerCategoryTitle = document.createElement('div');
        filterLabelContainerCategoryTitle.setAttribute("class", "filterLabelContainer");
        //Title Label
        const filterLabelCategory = document.createElement('span');
        filterLabelCategory.setAttribute("id", "filterLabelCategory");
        filterLabelCategory.setAttribute("class", "filterLabel");
        filterLabelCategory.innerHTML = Title;
        //Value Container
        const filterValueContainerCategory = document.createElement('div');
        filterValueContainerCategory.setAttribute("class", "filterValueContainerCB");
        //loop through how many checkbox there will be
        for (var i = 0; i < checkBoxValues.length; i++) {
            //Value Label
            const filterLabelValueCategory = document.createElement('span');
            filterLabelValueCategory.setAttribute("class", "filterLabelValueCB");
            filterLabelValueCategory.innerHTML = checkBoxValues[i];
            //Value CheckBox
            const filterValueCategory = document.createElement('input');
            filterValueCategory.setAttribute("type", "checkbox");
            filterValueCategory.setAttribute("class", "filterValueCB");
            filterValueCategory.setAttribute("data-field", fieldType);
            filterValueCategory.setAttribute("onchange", "callSearchServices(false)");

            //Validate if the Advance filter is in the URL query
            var urlQuery = window.location.hash.split("(");
            for (var j = 0; j < urlQuery.length; j++) {
                if (urlQuery[j].indexOf(fieldType) > 0 && decodeURI(urlQuery[j + 1]).indexOf(checkBoxValues[i]) > 0) {
                    filterValueCategory.checked = true;
                    break;
                }
            }

            //Insert into Value Container
            filterValueContainerCategory.appendChild(filterValueCategory);
            filterValueContainerCategory.appendChild(filterLabelValueCategory);
        }


        //Insert into Title Container
        filterLabelContainerCategoryTitle.appendChild(filterLabelCategory);
        filterLabelContainerCategoryTitle.appendChild(filterValueContainerCategory);
        //Insert into Box Container
        filterContainerOutterBox.appendChild(filterLabelContainerCategoryTitle);
        filterContainerOutterBox.appendChild(filterValueContainerCategory); //Filter


    } else if (filterType == "doubleText") {
        //Filter

        //Title Container
        const filterLabelContainerTitle = document.createElement('div');
        filterLabelContainerTitle.setAttribute("class", "filterLabelContainer");
        //Title Label
        const filterLabel = document.createElement('span');
        filterLabel.setAttribute("id", "filterLabel");
        filterLabel.setAttribute("class", "filterLabel");
        filterLabel.innerHTML = Title;
        //Value Container
        const filterValueContainer = document.createElement('div');
        filterValueContainer.setAttribute("class", "filterValueContainer");
        //Value From
        const filterValueFrom = document.createElement('input');
        filterValueFrom.setAttribute("type", "number");
        filterValueFrom.setAttribute("class", "filterValueFrom");
        filterValueFrom.setAttribute("placeholder", "De");
        filterValueFrom.setAttribute("data-field", fieldType);
        filterValueFrom.setAttribute("onchange", "callSearchServices(false)");
        filterValueFrom.value = oldPriceFrom;
        //Value To
        const filterValueTo = document.createElement('input');
        filterValueTo.setAttribute("type", "number");
        filterValueTo.setAttribute("class", "filterValueTo");
        filterValueTo.setAttribute("placeholder", "À");
        filterValueTo.setAttribute("data-field", fieldType);
        filterValueTo.setAttribute("onchange", "callSearchServices(false)");
        filterValueTo.value = oldPriceTo;

        //Insert into Value Container
        filterValueContainer.appendChild(filterValueFrom);
        filterValueContainer.appendChild(filterValueTo);
        //Insert into Title Container
        filterLabelContainerTitle.appendChild(filterLabel);
        filterLabelContainerTitle.appendChild(filterValueContainer);
        //Insert into Box Container
        filterContainerOutterBox.appendChild(filterLabelContainerTitle);
        filterContainerOutterBox.appendChild(filterValueContainer);
    } else {
        //Filter

        //Container
        const filterLabelContainerTitle = document.createElement('div');
        filterLabelContainerTitle.setAttribute("class", "filterLabelContainerEmpty");

        //Insert into Box Container
        filterContainerOutterBox.appendChild(filterLabelContainerTitle);
    }




    return filterContainerOutterBox;
}

//Create the Advance filter container
function createfilterContainer() {
    //Filter container
    var filterContainer = document.getElementById("filterContainer");
    var oldPriceFrom = null;
    var oldPriceTo = null;

    if (filterContainer == null) {
        filterContainer = document.createElement('div');
        filterContainer.setAttribute("id", "filterContainer");
    } else {
        oldPriceFrom = document.getElementsByClassName("filterValueFrom")[0].value;
        oldPriceTo = document.getElementsByClassName("filterValueTo")[0].value;
        filterContainer.innerHTML = "";
    }

    //each one of them are a new filter.
    filterContainer.appendChild(createBoxContainer("Prix", null, "doubleText", "tpprixnum", oldPriceFrom, oldPriceTo));
    filterContainer.appendChild(createBoxContainer("En Special", ['Yes'], "checkBox", "tpenspecial"));
    filterContainer.appendChild(createBoxContainer("Disponibilité", ['En Succursale', 'En Ligne', 'Bientôt disponible', 'Commande Spécial'], "checkBox", "tpdisponibilite"));
    filterContainer.appendChild(createBoxContainer("Catégorie", ['Vin Rouge', 'Vin Blanc', 'Whisky écossais', 'Champagne', 'Vin mousseux'], "checkBox", "tpcategorie"));
    filterContainer.appendChild(createBoxContainer("Pays", ['France', 'Italie ', 'États-Unis', 'Canada', 'Espagne', 'Portugal'], "checkBox", "tppays"));
    filterContainer.appendChild(createBoxContainer("Région", ['Bordeaux', 'Bourgogne', 'Californie', 'Toscane', 'Québec'], "checkBox", "tpregion"));
    filterContainer.appendChild(createBoxContainer("Millésime", ['2016 ', '2015 ', '2014 ', '2013 ', '2012'], "checkBox", "tpmillesime"));
    filterContainer.appendChild(createBoxContainer("Cote d'expert", ['WS 90', 'WA 90', 'WA 92', 'WA 91', 'WS 92'], "checkBox", "tpcoteexpertsplitgroup"));
    filterContainer.appendChild(createBoxContainer("Cépage", ['Chardonnay', 'Pinot noir', 'Cabernet-sauvignon', 'Merlot', 'Syrah'], "checkBox", "tpcepagenomsplitgroup"));
    filterContainer.appendChild(createBoxContainer("Classification", ['Estate bottled', 'Mention d\'âge', 'Reserva', 'Vin du Québec certifié', 'Riserva'], "checkBox", "tpclassification"));
    filterContainer.appendChild(createBoxContainer("Famille de vin", ['Corsé', 'Fruité', 'Moyennement corsé', 'Boisé'], "checkBox", "tpfamilledevinsplitgroup"));
    //insert padding at the end
    filterContainer.appendChild(createBoxContainer(null, null, "padding"));



    //insert Filter container on the page
    document.getElementById("header").appendChild(filterContainer);
}

//Create Header for the detail area
function createDetailHeader(data) {
    //Header container
    const headerDetailContainer = document.createElement('div');
    headerDetailContainer.setAttribute("class", "headerDetailContainer");


    //Header Results  
    var totalReturn = data.totalCount;
    var requestTime = (data.duration / 60).toFixed(2);

    //Total return container
    const treturnContainer = document.createElement('div');
    treturnContainer.setAttribute("class", "treturnContainer");
    treturnContainer.setAttribute("title", "Request returned in: " + requestTime + " second");
    treturnContainer.innerHTML = "Results: " + totalReturn + " items";

    //Total restults per page
    const tresultsperpageLbl = document.createElement('div');
    tresultsperpageLbl.setAttribute("class", "tresultsperpageLbl");
    tresultsperpageLbl.innerHTML = "Results per page:";

    const tresultsperpageSelect = document.createElement('select');
    tresultsperpageSelect.setAttribute("id", "tresultsperpageSelect")
    tresultsperpageSelect.setAttribute("onchange", 'updateResultsPerPage()');


    for (var i = 0; i < 3; i++) {
        const tresultsperpageOption = document.createElement('option');
        tresultsperpageOption.setAttribute("class", "tresultsperpageOption");
        if (i == 0) {
            tresultsperpageOption.innerHTML = "12";
            tresultsperpageOption.value = "12";
        } else if (i == 1) {
            tresultsperpageOption.innerHTML = "24";
            tresultsperpageOption.value = "24";
        } else if (i == 2) {
            tresultsperpageOption.innerHTML = "50";
            tresultsperpageOption.value = "50";
        }
        if (totalReturn >= tresultsperpageOption.value) {
            tresultsperpageSelect.appendChild(tresultsperpageOption);
        }
        if (resultsPerPage == "12") {
            tresultsperpageSelect.selectedIndex = 0;
        } else if (resultsPerPage == "24") {
            tresultsperpageSelect.selectedIndex = 1;
        } else if (resultsPerPage == "50") {
            tresultsperpageSelect.selectedIndex = 2;
        }



    }

    //insert header information in the header Container
    headerDetailContainer.appendChild(treturnContainer);
    headerDetailContainer.appendChild(tresultsperpageSelect);
    headerDetailContainer.appendChild(tresultsperpageLbl);

    //insert Header on the page
    document.getElementById("detail").appendChild(headerDetailContainer);
}


//Create Table with passing response
function createDetailDetail(data) {

    //Details Results
    var products = data.results;

    const tableContainer = document.createElement('table');
    tableContainer.setAttribute("class", "tableContainer");
    var trContainer = document.createElement('tr');
    var tdContainer = document.createElement('td');

    //Paging Top Container
    const topPagingContainer = document.createElement('div');
    topPagingContainer.setAttribute("id", "topPagingContainer");

    const pageCell = document.createElement('div');
    pageCell.setAttribute("class", "pageCell");


    //displaying the paging and setting the active page on with the currentPage variable
    var numberOfPages = Math.ceil(data.totalCount / resultsPerPage);
    var backPageDisplayed = false;

    var firstPageDisplayed = 1;
    var endPageDisplayed = 11;

    if (currentPage - 5 < 1) {
        firstPageDisplayed = 1;
        endPageDisplayed = 12;
    } else {
        firstPageDisplayed = currentPage - 5;
        endPageDisplayed = currentPage + 6;
    }

    for (var i = firstPageDisplayed; i < endPageDisplayed; i++) {
        if (i <= numberOfPages && i > 0) {
            if (!backPageDisplayed) {
                const pageItemBack = document.createElement('span');
                pageItemBack.setAttribute("class", "pageItem");

                const linkPageBack = document.createElement('a');
                linkPageBack.setAttribute("class", "linkPage");
                //back page
                if (Number(currentPage) > 1) {
                    linkPageBack.setAttribute("value", '&laquo;');
                    pageItemBack.innerHTML = '&laquo;';
                    var previousPage = Number(currentPage) - 1;
                    pageItemBack.setAttribute("onclick", 'goToPage(' + previousPage + ')');

                    pageItemBack.appendChild(linkPageBack);
                    pageCell.appendChild(pageItemBack);

                    backPageDisplayed = true;
                }
            }
            const pageItem = document.createElement('span');
            pageItem.setAttribute("class", "pageItem");

            const linkPage = document.createElement('a');
            linkPage.setAttribute("class", "linkPage");
            if (i == endPageDisplayed - 1) {
                //next page
                linkPage.setAttribute("value", '&raquo;');
                pageItem.innerHTML = '&raquo;';
                var nextPage = Number(currentPage) + 1;
                pageItem.setAttribute("onclick", 'goToPage(' + nextPage + ')');
            } else if (i == currentPage) {
                pageItem.setAttribute("id", "activePage");
                linkPage.setAttribute("value", i);
                pageItem.setAttribute("onclick", 'goToPage(' + i + ')');
                pageItem.innerHTML = i;
            } else {
                linkPage.setAttribute("value", i);
                pageItem.setAttribute("onclick", 'goToPage(' + i + ')');
                pageItem.innerHTML = i;
            }



            pageItem.appendChild(linkPage);
            pageCell.appendChild(pageItem);
        } else {
            if (i == currentPage + 11) {
                const pageItem = document.createElement('span');
                pageItem.setAttribute("class", "pageItem");

                const linkPage = document.createElement('a');
                linkPage.setAttribute("class", "linkPage");
                linkPage.setAttribute("onclick", 'goToPage(this.value)');
                linkPage.setAttribute("value", '&raquo;');
                pageItem.innerHTML = '&raquo;';
                pageItem.appendChild(linkPage);
                pageCell.appendChild(pageItem);
            }
        }
    }

    topPagingContainer.appendChild(pageCell);


    for (var i = 0; i < products.length; i++) {


        if (!testNumber(i, 4) || i == 0) {
            trContainer = document.createElement('tr');
            trContainer.setAttribute("class", "trContainer");
        }
        tdContainer = document.createElement('td');

        //tile container
        const divContainer = document.createElement('div');
        divContainer.setAttribute("class", "divContainer");

        //product information container
        const divInfoContainer = document.createElement('div');
        divInfoContainer.setAttribute("class", "divInfoContainer");

        //image container
        const divImgContainer = document.createElement('div');
        divImgContainer.setAttribute("class", "divImgContainer");

        //Product Name
        const pTitle = document.createElement("span");
        pTitle.setAttribute("class", "pTitle");
        pTitle.className += " divInfoText";
        pTitle.innerHTML = products[i].Title;

        //Product Type
        const tpcategorieraw = document.createElement("span");
        tpcategorieraw.setAttribute("class", "tpcategorieraw");
        tpcategorieraw.className += " divInfoText";
        tpcategorieraw.innerHTML = products[i].raw.tpcategorieraw;

        //Product Location
        const tplocation = document.createElement("span");
        tplocation.setAttribute("class", "tplocation");
        tplocation.className += " divInfoText";
        tplocation.innerHTML = products[i].raw.tppays + ", " + products[i].raw.tpregion;

        //Product price
        const tpprixnormal = document.createElement("span");
        tpprixnormal.setAttribute("class", "tpprixnormal");
        tpprixnormal.innerHTML = products[i].raw.tpprixnormal;

        //Image Link
        const sysclickableuri = document.createElement("a");
        sysclickableuri.setAttribute("href", products[i].raw.sysclickableuri);
        sysclickableuri.setAttribute("target", "_blank");

        //Image
        const pImg = document.createElement("img");
        pImg.setAttribute("class", "pImg");
        pImg.setAttribute("src", products[i].raw.tpthumbnailuri);
        pImg.setAttribute("alt", products[i].raw.systitle);

        //adding objects into info container
        divInfoContainer.appendChild(pTitle);
        divInfoContainer.appendChild(tpcategorieraw);
        divInfoContainer.appendChild(tplocation);
        divInfoContainer.appendChild(tpprixnormal);

        //adding objects into image container
        sysclickableuri.appendChild(pImg);
        divImgContainer.appendChild(sysclickableuri);

        //inserting objects into the containers
        divContainer.appendChild(divImgContainer);
        divContainer.appendChild(divInfoContainer);
        tdContainer.appendChild(divContainer);
        trContainer.appendChild(tdContainer);
        tableContainer.appendChild(trContainer);

    }


    //Paging Bottom Container
    const bottomPagingContainer = document.createElement('div');
    bottomPagingContainer.setAttribute("id", "bottomPagingContainer");

    bottomPagingContainer.innerHTML = topPagingContainer.innerHTML;


    //insert details on the page
    document.getElementById("detail").appendChild(topPagingContainer);
    document.getElementById("detail").appendChild(tableContainer);
    document.getElementById("detail").appendChild(bottomPagingContainer);
}

//passing the page no to go to that page
function goToPage(pageNo) {
    if (!isNaN(pageNo)) {
        currentPage = pageNo;
        callSearchServices(false);
    }

}

//function to open the filter menu
function openCloseFilterMenu() {
    const filterContainer = document.getElementById("filterContainer");

    if (filterContainer.style.left == "0px") {
        //close
        filterContainer.style.left = "-250px";
    } else {
        //open
        filterContainer.style.left = "0px";
    }
}

//function to close the filter menu when clicking on the page
function closeFilterContainer() {
    const filterContainer = document.getElementById("filterContainer");
    if (filterContainer != null) {
        filterContainer.style.left = "-250px";
    }
}

//when "Enter" is pressed in the search bar it will launch the search service function
document.getElementById("searchBar").addEventListener("keyup", function (e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        callSearchServices(false);
    }
});

// when page load, load objects and get first set of data from search bar.
document.onload = callSearchServices(true);
