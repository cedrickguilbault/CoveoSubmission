<%-- 
    Document   : index
    Created on : Mar 4, 2019, 4:37:02 PM
    Author     : cguilbault
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Coveo</title>
  
  <link href="css/coveo.css" rel="stylesheet">

</head>


<body>

  <div id="header" class="topnav">
      <div class="filterBar" onclick="openCloseFilterMenu()" title="Advance options"><div class="filterBarImg" alt="filterBar"> </div></div>
  
  <div  class="search-container">
      <input type="text" id="searchBar" placeholder="Search.." href="javascript:" name="search">
      <div class="searchContainer" onclick="callSearchServices(false)"><div class="searchBtn" alt="Search"> </div></div>
  </div>
</div>

<div id="detail" onclick="closeFilterContainer()" style="padding-left:16px;padding-top: 150px;"></div>

  <script src="js/coveo.js"></script>
</body>

</html>