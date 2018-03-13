require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "dojo/on",
    "dojo/domReady!"
  ],
  function(
    Map, MapView, MapImageLayer, QueryTask, Query, on
  ) {


    // RENDERERS
    var cityRenderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        style: "none",
        outline: {
          width: 2,
          color: "black"
        }
      }
    };

    var zoneRenderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: "yellow",
        outline: {
          width: 1,
          color: "black"
        }
      }
    };


    /*****************************************************************
     * Create a MapImageLayer instance pointing to a Map Service
     * containing data about US Cities, Counties, States and Highways.
     * Define sublayers with visibility for each layer in Map Service.
     *****************************************************************/
    var cityLimit = new MapImageLayer({
      url: "https://gis.interdev.com/arcgis/rest/services/Stonecrest/CityLimits/MapServer",
      sublayers: [{
        id: 0,
        renderer: cityRenderer,
        visible: true
      }]
    });

    var mask = new MapImageLayer({
      url: "https://gis.interdev.com/arcgis/rest/services/Stonecrest/GeneralServices/MapServer",
      sublayers: [{
        id: 4,
        visible: true
      }]
    });

    var zoneLyr = new MapImageLayer({
      url: "https://gis.interdev.com/arcgis/rest/services/Stonecrest/ZoningSimplified/MapServer",
      opacity: 0.3,
    });

    var zoningLyr = new MapImageLayer({
      url: "https://gis.interdev.com/arcgis/rest/services/Stonecrest/ZoningSimplified/MapServer",
      sublayers: [{
        id: 0,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 1,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 2,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 3,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 4,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 5,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 6,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 7,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 8,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 9,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 10,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 11,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 12,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 13,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 14,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 15,
        renderer: zoneRenderer,
        visible: false
      }, {
        id: 16,
        renderer: zoneRenderer,
        visible: false
      }]
    });

    // ADD LAYERS TO MAP
    var map = new Map({

      layers: [zoneLyr, zoningLyr, mask, cityLimit]
    });

    var view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 11,
      center: [-84.122, 33.675]
    });


    // DISABLE ZOOM AND PANNING

    view.when(disableZooming);

    /**
     * Disables all zoom gestures on the given view instance.
     *
     * @param {esri/views/MapView} view - The MapView instance on which to
     *                                  disable zooming gestures.
     */
    function disableZooming(view) {
      view.popup.dockEnabled = true;

      // Removes the zoom action on the popup
      view.popup.actions = [];

      // stops propagation of default behavior when an event fires
      function stopEvtPropagation(evt) {
        evt.stopPropagation();
      }

      // exlude the zoom widget from the default UI
      view.ui.components = ["attribution"];

      // disable mouse wheel scroll zooming on the view
      view.on("mouse-wheel", stopEvtPropagation);

      // disable zooming via double-click on the view
      view.on("double-click", stopEvtPropagation);

      // disable zooming out via double-click + Control on the view
      view.on("double-click", ["Control"], stopEvtPropagation);

      // disables pinch-zoom and panning on the view
      view.on("drag", stopEvtPropagation);

      // disable the view's zoom box to prevent the Shift + drag
      // and Shift + Control + drag zoom gestures.
      view.on("drag", ["Shift"], stopEvtPropagation);
      view.on("drag", ["Shift", "Control"], stopEvtPropagation);

      // prevents zooming with the + and - keys
      view.on("key-down", function(evt) {
        var prohibitedKeys = ["+", "-", "Shift", "_", "="];
        var keyPressed = evt.key;
        if (prohibitedKeys.indexOf(keyPressed) !== -1) {
          evt.stopPropagation();
        }
      });

      return view;
    };


    // QUERY FUNCTION
    function findIt(a) {
      var zLayerUrl = "https://gis.interdev.com/arcgis/rest/services/Stonecrest/ZoningSimplified/MapServer/17";
      var queryTask = new QueryTask({
        url: zLayerUrl
      });
      var query = new Query();

      query.returnGeometry = false;
      query.outFields = ["*"];
      query.where = "ZONING = '" + a + "'";

      // WHEN RESOLVED, RETURNS FEATURES THAT SATISFY QUERY
      queryTask.execute(query).then(function(results) {
        queryTask.executeForCount(query).then(function(a) {
          for (i = 0; i < a; i++) {

            // VARIABLES FOR EACH PERMITTED USE TYPE
            var permittedUse = results.features[i].attributes.P;
            var permittedAccessory = results.features[i].attributes.Pa;
            var spAdmin = results.features[i].attributes.SA;
            var spLUP = results.features[i].attributes.SP;

            var table = document.getElementById("myTable");
            var row = table.insertRow(i);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);

            // INSERTS QUERY RESULTS IN CORRECT COLUMN OF PERMITTED USE TABLE
            cell1.innerHTML = permittedUse;
            cell2.innerHTML = permittedAccessory;
            cell3.innerHTML = spAdmin;
            cell4.innerHTML = spLUP;
          }
        })
      });
    };


    // LISTENS FOR ZONING SELECTION THEN SHOWS ON MAP AND EXECUTES QUERY
    var sublayersElement = document.querySelector(".zTable");
    on(sublayersElement, ".zTable-item:click", function(e) {
      var id = e.target.getAttribute("data-id");
      var subItem = document.getElementsByClassName("zTable-item");

      // REMOVES PREVIOUS QUERY RESULTS
      document.getElementById("myTable").innerHTML = "";


      for (i = 0; i < subItem.length; i++) {
        var subID = document.getElementsByClassName("zTable-item")[i].getAttribute("data-id");
        var sublayer = zoningLyr.findSublayerById(parseInt(subID));
        var node = document.querySelector(".zTable-item[data-id='" +
          subID + "']");


        if (id == subID) {
          sublayer.visible = !sublayer.visible;
          node.classList.toggle("visible-layer");

          findIt(node.innerHTML);

        } else {
          sublayer.visible = false;
          node.classList.remove("visible-layer");
        }
      }
    });
  });
