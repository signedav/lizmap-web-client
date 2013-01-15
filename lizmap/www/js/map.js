/**
* Class: lizMap
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/


var lizMap = function() {
  /**
   * PRIVATE Property: config
   * {object} The map config
   */
  var config = null;
  /**
   * PRIVATE Property: capabilities
   * {object} The wms capabilities
   */
  var capabilities = null;
  /**
   * PRIVATE Property: map
   * {<OpenLayers.Map>} The map
   */
  var map = null;
  /**
   * PRIVATE Property: baselayers
   * {Array(<OpenLayers.Layer>)} Ordered list of base layers
   */
  var baselayers = [];
  /**
   * PRIVATE Property: layers
   * {Array(<OpenLayers.Layer>)} Ordered list of layers
   */
  var layers = [];
  /**
   * PRIVATE Property: tree
   * {object} The layer's tree
   */
  var tree = {config:{type:'group'}};


  /**
   * PRIVATE function: cleanName
   * cleaning layerName for class and layer
   */
  function cleanName(aName){
    var accentMap = {
        "à": "a",    "á": "a",    "â": "a",    "ã": "a",    "ä": "a",    "ç": "c",    "è": "e",    "é": "e",    "ê": "e",    "ë": "e",    "ì": "i",    "í": "i",    "î": "i",    "ï": "i",    "ñ": "n",    "ò": "o",    "ó": "o",    "ô": "o",    "õ": "o",    "ö": "o",    "ù": "u",    "ú": "u",    "û": "u",    "ü": "u",    "ý": "y",    "ÿ": "y",
        "À": "A",    "Á": "A",    "Â": "A",    "Ã": "A",    "Ä": "A",    "Ç": "C",    "È": "E",    "É": "E",    "Ê": "E",    "Ë": "E",    "Ì": "I",    "Í": "I",    "Î": "I",    "Ï": "I",    "Ñ": "N",    "Ò": "O",    "Ó": "O",    "Ô": "O",    "Õ": "O",    "Ö": "O",    "Ù": "U",    "Ú": "U",    "Û": "U",    "Ü": "U",    "Ý": "Y",
        "-":" ", "'": " ", "(": " ", ")": " "};
    var normalize = function( term ) {
        var ret = "";
        for ( var i = 0; i < term.length; i++ ) {
            ret += accentMap[ term.charAt(i) ] || term.charAt(i);
        }
        return ret;
    };
    aName = normalize(aName);
    return aName.replace(' ', '_', 'gi');
  }


  /**
   * PRIVATE function: updateMobile
   * Determine if we should display the mobile version.
   */
  function updateMobile(){
    mobileContext = lizMap.checkMobile();

    if(mobileContext){
      // Change menu and map content width
      $('#menu').css('width', '100%');

      // hide overview map
      if (config.options.hasOverview){
        $('#overview-bar button').hide();
        $('#overviewmap').hide();
      }

      // Display baselayer choice 100%
      $('#baselayer-select-input').css('bottom','50px').css('left','0px').css('right','0px')

      if( !$('#toggleLegend').is(':visible'))
        $('#menu').hide();

      // activate Legend menu
      $('#toggleLegend')
      .css('cursor', 'pointer')
      .show();

    }
    else{
      // Change menu and map content width
      $('#menu').css('width', '300px');

      // Display baselayer choice 100%
      $('#baselayer-select-input').css('bottom','0px').css('left','300px').css('right','')

      // Display overview map
      if (config.options.hasOverview){
        $('#overviewmap').show();
        $('#overview-bar button').show();
      }

      if( $('#toggleLegend').is(':visible'))
        $('#menu').show();

      // Hide legend menu
      $('#toggleLegend').hide();

    }
  }


  /**
   * PRIVATE function: updateContentSize
   * update the content size
   */
  function updateContentSize(){

   updateMobile();

   var h = $('body').parent()[0].clientHeight;
   h = h - $('#header').height();
   h = h - $('#headermenu').height();

   $('#menu').height(h);
   $('#map').height(h);
   var w = $('body').parent()[0].offsetWidth;

   if ($('#menu').is(':hidden')) {
     $('#map-content').css('margin-left',0);
   } else {
     w -= $('#menu').width();
     $('#map-content').css('margin-left',$('#menu').width());
   }
   $('#map').width(w);

    updateMapSize();

  }


  /**
   * PRIVATE function: updateMapSize
   * update the map size
   */
 function updateMapSize(){
    var center = map.getCenter();
    map.updateSize();
    map.setCenter(center);
    map.baseLayer.redraw();

    if ($('#navbar').height()+150 > $('#map').height() || mCheckMobile())
      $('#navbar .slider').hide();
    else
      $('#navbar .slider').show();

    updateSwitcherSize();
  }

  /**
   * PRIVATE function: updateSwitcherSize
   * update the switcher size
   */
  function updateSwitcherSize(){
    /*
    switcherMaxHeight = $('body').parent()[0].clientHeight - $('#header').height() - 20 - $('#switcherContainer').outerHeight() + $('#switcher').outerHeight();
    $('#switcher').css('height','auto').css('overflow','visible');
    if ($('#switcher').outerHeight() > switcherMaxHeight)
      $('#switcher').height(switcherMaxHeight).css('overflow','auto');
      */
    var h = $('body').parent()[0].clientHeight;
    if(!h)
        h = $('window').innerHeight();

    h = h - $('#header').height();
    h = h - $('#headermenu').height();
    $('#menu').height(h);
    //var h = $('#menu').height();
    h -= $('#close-menu').outerHeight(true);
    h -= $('#toolbar').outerHeight(true);
    if ($('#locate-menu').is(':visible'))
      h -= $('#locate-menu').outerHeight(true);
    h -= $('#baselayer-menu').outerHeight(true);
    h -= $('#switcher-menu').children().first().outerHeight(true);

    var sw = $('#switcher');

    h -= (parseInt(sw.css('margin-top')) ? parseInt(sw.css('margin-top')) : 0 ) ;
    h -= (parseInt(sw.css('margin-bottom')) ? parseInt(sw.css('margin-bottom')) : 0 ) ;
    h -= (parseInt(sw.css('padding-top')) ? parseInt(sw.css('padding-top')) : 0 ) ;
    h -= (parseInt(sw.css('padding-bottom')) ? parseInt(sw.css('padding-bottom')) : 0 ) ;
    h -= (parseInt(sw.css('border-top-width')) ? parseInt(sw.css('border-top-width')) : 0 ) ;
    h -= (parseInt(sw.css('border-bottom-width')) ? parseInt(sw.css('border-bottom-width')) : 0 ) ;
    var swp = sw.parent();
    h -= (parseInt(swp.css('padding-top')) ? parseInt(swp.css('padding-top')) : 0 ) ;
    h -= (parseInt(swp.css('padding-bottom')) ? parseInt(swp.css('padding-bottom')) : 0 ) ;

    $('#switcher').height(h);


  }


  /**
   * PRIVATE function: getLayerLegendGraphicUrl
   * get the layer legend graphic
   *
   * Parameters:
   * name - {text} the layer name
   * withScale - {boolean} url with scale parameter
   *
   * Dependencies:
   * wmsServerUrl
   *
   * Returns:
   * {text} the url
   */
  function getLayerLegendGraphicUrl(name, withScale) {
    var layer = null
    $.each(layers,function(i,l) {
      if (layer == null && l.name == name)
        layer = l;
    });
    var legendParams = {SERVICE: "WMS",
                  VERSION: "1.3.0",
                  REQUEST: "GetLegendGraphics",
                  LAYERS: layer.params['LAYERS'],
                  EXCEPTIONS: "application/vnd.ogc.se_inimage",
                  FORMAT: "image/png",
                  TRANSPARENT: "TRUE",
                  WIDTH: 150,
                  LAYERFONTSIZE: 9,
                  ITEMFONTSIZE: 9,
                  SYMBOLSPACE: 1,
                  DPI: 96};
    var layerConfig = config.layers[layer.params['LAYERS']];
    if (layerConfig.id==layerConfig.name)
      legendParams['LAYERFONTBOLD'] = "TRUE";
    else {
      legendParams['LAYERFONTSIZE'] = 0;
      legendParams['LAYERSPACE'] = 0;
    }
    if (withScale)
      legendParams['SCALE'] = map.getScale();
    var legendParamsString = OpenLayers.Util.getParameterString(legendParams);
    return OpenLayers.Util.urlAppend(wmsServerURL, legendParamsString);
  }

  /**
   * PRIVATE function: getLayerScale
   * get the layer scales based on children layer
   *
   * Parameters:
   * nested - {Object} a capability layer
   * minScale - {Float} the nested min scale
   * maxScale - {Float} the nested max scale
   *
   * Dependencies:
   * config
   *
   * Returns:
   * {Object} the min and max scales
   */
  function getLayerScale(nested,minScale,maxScale) {
    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var layer = nested.nestedLayers[i];
      var layerConfig = config.layers[layer.name];
      if (layer.nestedLayers.length != 0)
         return getLayerScale(layer,minScale,maxScale);
      if (layerConfig) {
        if (minScale == null)
          minScale=layerConfig.minScale;
        else if (layerConfig.minScale<minScale)
          minScale=layerConfig.minScale;
        if (maxScale == null)
          maxScale=layerConfig.maxScale;
        else if (layerConfig.maxScale>maxScale)
          maxScale=layerConfig.maxScale;
      }
    }
    return {minScale:minScale,maxScale:maxScale};
  }

  /**
   * PRIVATE function: getLayerOrder
   * get the layer order and calculate it if it's a QGIS group
   *
   * Parameters:
   * nested - {Object} a capability layer
   *
   * Dependencies:
   * config
   *
   * Returns:
   * {Integer} the layer's order
   */
  function getLayerOrder(nested) {
    // there is no layersOrder in the project
    if (!('layersOrder' in config))
      return -1;

    // the nested is a layer and not a group
    if (nested.nestedLayers.length == 0)
      if (nested.name in config.layersOrder)
        return config.layersOrder[nested.name];
      else
        return -1;

    // the nested is a group
    var order = -1;
    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var layer = nested.nestedLayers[i];
      var lOrder = -1;
      if (layer.nestedLayers.length != 0)
        lOrder = getLayerScale(layer);
      else if (layer.name in config.layersOrder)
        lOrder = config.layersOrder[layer.name];
      else
        lOrder = -1;
      if (lOrder != -1) {
        if (order == -1 || lOrder < order)
          order = lOrder;
      }
    }
    return order;
  }

  /**
   * PRIVATE function: getLayerTree
   * get the layer tree
   * create OpenLayers WMS base or not layer {<OpenLayers.Layer.WMS>}
   * push these layers in layers or baselayers
   *
   * Parameters:
   * nested - {Object} a capability layer
   * pNode - {Object} the nested tree node
   *
   * Dependencies:
   * config
   * layers
   * baselayers
   */
  function getLayerTree(nested,pNode) {
    pNode.children = [];
    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var layer = nested.nestedLayers[i];
      var layerConfig = config.layers[layer.name];
      var layerName = cleanName(layer.name);

      if (layer.name.toLowerCase() == 'hidden')
        continue;

      // if the layer is not the Overview and had a config
      // creating the {<OpenLayers.Layer.WMS>} and the tree node
      if (layer.name != 'Overview' && layerConfig) {
        var node = {name:layerName,config:layerConfig,parent:pNode};
        var service = wmsServerURL;
        var layerWmsParams = {
          layers:layer.name
          ,version:'1.3.0'
          ,exceptions:'application/vnd.ogc.se_inimage'
          ,format:(layerConfig.imageFormat) ? layerConfig.imageFormat : 'image/png'
          ,dpi:96
        };
        if (layerWmsParams.format != 'image/jpeg')
          layerWmsParams['transparent'] = true;

        if (layerConfig.baseLayer == 'True') {
        // creating the base layer
          baselayers.push(new OpenLayers.Layer.WMS(layerName,service
              ,layerWmsParams
              ,{isBaseLayer:true
               ,gutter:(layerConfig.cached == 'True') ? 0 : 5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
              }));

        }
        else if (layerConfig.type == 'layer' && layer.nestedLayers.length != 0) {
        // creating the layer because it's a layer and has children
          var minScale = layerConfig.minScale;
          var maxScale = layerConfig.maxScale;
          // get the layer scale beccause, it has children
          var scales = getLayerScale(layer,null,null);
          layers.push(new OpenLayers.Layer.WMS(layerName,service
              ,layerWmsParams
              ,{isBaseLayer:false
               ,minScale:scales.maxScale
               ,maxScale:scales.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
               ,order:getLayerOrder(layer)
              }));
        }
        else if (layerConfig.type == 'layer') {
        // creating the layer because it's a layer and has no children
          layers.push(new OpenLayers.Layer.WMS(layerName,service
              ,layerWmsParams
              ,{isBaseLayer:false
               ,minScale:layerConfig.maxScale
               ,maxScale:layerConfig.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
               ,order:getLayerOrder(layer)
              }));
        }
        // creating the layer tre because it's a group, has children and is not a base layer
        if (layerConfig.type == 'group' && layer.nestedLayers.length != 0 && layerConfig.baseLayer == 'False')
          getLayerTree(layer,node);
        if (layerConfig.baseLayer != 'True')
          pNode.children.push(node);
      } else if (layer.name == 'Overview'){
        config.options.hasOverview = true;
      }
    }
  }

  /**
   * PRIVATE function: analyseNode
   * analyse Node Config
   * define if the node has to be a child of his parent node
   *
   * Parameters:
   * aNode - {Object} a node config
   *
   * Returns:
   * {Boolean} maintains the node in the tree
   */
  function analyseNode(aNode) {
    var nodeConfig = aNode.config;
    if (nodeConfig.type == 'layer' && nodeConfig.baseLayer != 'True')
      return true;
    else if (nodeConfig.type == 'layer')
      return false;

    if (!('children' in aNode))
      return false;
    var children = aNode.children;
    var result = false;
    var removeIdx = [];
    for (var i=0, len=children.length; i<len; i++) {
      var child = children[i];
      var analyse = analyseNode(child);
      if (!analyse)
        removeIdx.push(i);
      result = (result || analyse);
    }
    removeIdx.reverse();
    for (var i=0, len=removeIdx.length; i<len; i++) {
      children.splice(removeIdx[i],1);
    }
    return result;
  }

  /**
   * PRIVATE function: getSwitcherLine
   * get the html table line <tr> of a config node for the switcher
   *
   * Parameters:
   * aNode - {Object} a config node
   *
   * Returns:
   * {String} the <tr> html corresponding to the node
   */
  function getSwitcherLine(aNode, aParent) {
    var html = '';

    var nodeConfig = aNode.config;
    html += '<tr id="'+nodeConfig.type+'-'+aNode.name+'"';
    html += ' class="liz-'+nodeConfig.type;
    if (aParent)
      html += ' child-of-group-'+aParent.name;
    if (('children' in aNode) && aNode['children'].length!=0)
      html += ' expanded parent';
    html += '">';

    html += '<td><button class="checkbox" name="'+nodeConfig.type+'" value="'+aNode.name+'" title="'+dictionary['tree.button.checkbox']+'"></button>';
    html += '<span class="label" title="'+nodeConfig.abstract+'">'+nodeConfig.title+'</span>';
    html += '</td>';

    html += '<td>';
    if (nodeConfig.type == 'layer')
      html += '<span class="loading">&nbsp;</span>';
    html += '</td>';

    var legendLink = '';
    if (nodeConfig.link)
      legendLink = nodeConfig.link;
    if (legendLink != '' )
      html += '<td><button class="link" name="link" title="'+dictionary['tree.button.link']+'" value="'+legendLink+'"/></td>';
    else
      html += '<td></td>';

    html += '</tr>';

    if (nodeConfig.type == 'layer') {
      var url = getLayerLegendGraphicUrl(aNode.name, false);

      html += '<tr id="legend-'+aNode.name+'" class="child-of-layer-'+aNode.name+' legendGraphics">';
      html += '<td colspan="2"><div class="legendGraphics"><img src="'+url+'"/></div></td>';
      html += '</tr>';
    }

    return html;
  }

  /**
   * PRIVATE function: getSwitcherNode
   * get the html of a config node for the switcher
   *
   * Parameters:
   * aNode - {Object} a config node
   *
   * Returns:
   * {String} the html corresponding to the node
   */
  function getSwitcherNode(aNode,aLevel) {
    var html = '';
    if (aLevel == 0
     && ('rootGroupsAsBlock' in config.options)
     && config.options['rootGroupsAsBlock'] == 'True') {
      var children = aNode.children;
      var previousSibling;
      for (var i=0, len=children.length; i<len; i++) {
        var child = children[i];
        if (('children' in child) && child['children'].length!=0) {
          if (previousSibling && ( (('children' in previousSibling) && previousSibling['children'].length==0) || !('children' in previousSibling)) ) {
            html += '</table>';
            html += '</div>';
          }
          html += '<div class="'+child.name+'">';
          html += '<table class="tree">';
          var grandChildren = child.children;
          for (var j=0, jlen=grandChildren.length; j<jlen; j++) {
            var grandChild = grandChildren[j];
            html += getSwitcherLine(grandChild);

            if (('children' in grandChild) && grandChild['children'].length!=0)
              html += getSwitcherNode(grandChild, aLevel+1);
          }
          html += '</table>';
          html += '</div>';
        } else {
          if (previousSibling && ('children' in previousSibling) && previousSibling['children'].length!=0) {
            html += '<div class="no-group">';
            html += '<table class="tree">';
          }
          html += getSwitcherLine(child);
        }
        previousSibling = child;
      }
      if ((('children' in previousSibling) && previousSibling['children'].length==0) || !('children' in previousSibling)) {
        html += '</table>';
        html += '</div>';
      }
      return html;
    }
    if (aLevel == 0) {
      html += '<div class="no-group">';
      html += '<table class="tree">';
    }

    var children = aNode.children;
    for (var i=0, len=children.length; i<len; i++) {
      var child = children[i];
      if (aLevel == 0)
        html += getSwitcherLine(child);
      else
        html += getSwitcherLine(child,aNode);

      if (('children' in child) && child['children'].length!=0)
        html += getSwitcherNode(child, aLevel+1);
    }

    if (aLevel == 0) {
      html += '</table>';
      html += '</div>';
    }
    return html;
  }

  /**
   * PRIVATE function: createMap
   * creating the map {<OpenLayers.Map>}
   */
  function createMap() {
    // get and define projection
    var proj = config.options.projection;
    Proj4js.defs[proj.ref]=proj.proj4;
    var projection = new OpenLayers.Projection(proj.ref);
    OpenLayers.Projection.defaults[proj.ref] = projection;

    // get and define the max extent
    var bbox = config.options.bbox;
    var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
    var mapHeight = $('body').parent()[0].clientHeight;
    mapHeight = mapHeight - $('#header').height();
    mapHeight = mapHeight - $('#headermenu').height();
    $('#map').height(mapHeight);
    var res = extent.getHeight()/$('#map').height();

    var scales = config.options.mapScales;
    scales.sort();

    // creating the map
    OpenLayers.Util.DEFAULT_PRECISION=20; // default is 14 : change needed to avoid rounding problem with cache
    map = new OpenLayers.Map('map'
      ,{controls:[new OpenLayers.Control.Navigation(),new OpenLayers.Control.ZoomBox({alwaysZoom:true}), new OpenLayers.Control.NavigationHistory()]
       ,eventListeners:{
         zoomend: function(evt){
  // private treeTable
  var options = {
    childPrefix : "child-of-"
  };

  function childrenOf(node) {
    return $(node).siblings("tr." + options.childPrefix + node[0].id);
  };

  function descendantsOf(node) {
    var descendants = [];
    var children = [];
    if (node && node[0])
      children = childrenOf(node);
    for (var i=0, len=children.length; i<len; i++) {
      descendants.push(children[i]);
      descendants = descendants.concat(descendantsOf([children[i]]));
    }
    return descendants;
  };

  function parentOf(node) {
    var classNames = node[0].className.split(' ');

    for(var key=0; key<classNames.length; key++) {
      if(classNames[key].match(options.childPrefix)) {
        return $(node).siblings("#" + classNames[key].substring(options.childPrefix.length));
      }
    }

    return null;
  };

  function ancestorsOf(node) {
    var ancestors = [];
    while(node = parentOf(node)) {
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };
           //layer visibility
           for (var i=0,len=layers.length; i<len; i++) {
             var layer = layers[i];
             var b = $('#switcher button[name="layer"][value="'+layer.name+'"]').first();
             if (layer.inRange && b.button('option','disabled')) {
               var tr = b.parents('tr').first();
               tr.removeClass('liz-state-disabled').find('button').button('enable');
               var ancestors = ancestorsOf(tr);
               $.each(ancestors,function(i,a) {
                 $(a).removeClass('liz-state-disabled').find('button').button('enable');
               });
               if (tr.find('button[name="layer"]').button('option','icons').primary == 'liz-icon-check')
                 layer.setVisibility(true);
             } else if (!layer.inRange && !b.button('option','disabled')) {
               var tr = b.parents('tr').first();
               tr.addClass('liz-state-disabled').find('button').first().button('disable');
               if (tr.hasClass('liz-layer'))
                 tr.collapse();
               var ancestors = ancestorsOf(tr);
               $.each(ancestors,function(i,a) {
        a = $(a);
        var count = 0;
        var checked = 0;
        var aDesc = childrenOf(a);
        $.each(aDesc,function(j,trd) {
          $(trd).find('button.checkbox').each(function(i,b){
            if ($(b).button('option','disabled'))
              checked++;
            count++;
          });
        });
                 if (count == checked)
                   a.addClass('liz-state-disabled').find('button').first().button('disable');
                 else
                   a.removeClass('liz-state-disabled').find('button').button('enable');
               });
             }
           }


           //slider
           $('#navbar div.slider').slider("value",this.getZoom());

           //pan button
           $('#navbar button.pan').click();

           updateSwitcherSize();

//           alert('scale = ' + map.getScale() + '\nresolution=' + map.getResolution());
         }
        }

       ,maxExtent:extent
       ,maxScale: scales.length == 0 ? config.options.minScale : "auto"
       ,minScale: scales.length == 0 ? config.options.maxScale : "auto"
       ,numZoomLevels: scales.length == 0 ? config.options.zoomLevelNumber : scales.length
       ,scales: scales.length == 0 ? null : scales
       ,projection:projection
       ,units:projection.proj.units
       ,allOverlays:(baselayers.length == 0)
    });
    map.addControl(new OpenLayers.Control.Attribution({div:document.getElementById('attribution')}));

    // add handler to update the map size
    $(window).resize(function() {
      updateContentSize();
    });
  }

  /**
   * create the layer switcher
   */
  function getLocateFeature(aName) {
    var locate = config.locateByLayer[aName];
    var wfsOptions = {
      'SERVICE':'WFS'
     ,'VERSION':'1.0.0'
     ,'REQUEST':'GetFeature'
     ,'TYPENAME':aName
     ,'PROPERTYNAME':'geometry,'+locate.fieldName
     ,'OUTPUTFORMAT':'GeoJSON'
    };
    $.get(wmsServerURL,wfsOptions,function(data) {
      locate['features'] = {};
      var features = data.features;
      features.sort(function(a, b) {
        return a.properties[locate.fieldName].localeCompare(b.properties[locate.fieldName]);
      });
      var lConfig = config.layers[aName];
      var options = '<option value="0">'+lConfig.title+' layer</option>';
      for (var i=0, len=features.length; i<len; i++) {
        var feat = features[i];
        locate.features[feat.id.toString()] = feat;
        options += '<option value="'+feat.id+'">'+feat.properties[locate.fieldName]+'</option>';
      }
      $('#locate-layer-'+aName).html(options).change(function() {
        var proj = new OpenLayers.Projection(locate.crs);
        var val = parseInt($(this).val());
        if (val == '0') {
          var bbox = new OpenLayers.Bounds(locate.bbox);
          bbox.transform(proj, map.getProjection());
          map.zoomToExtent(bbox);
        } else {
          var feat = locate.features[val];
          var format = new OpenLayers.Format.GeoJSON();
          feat = format.read(feat)[0];
          feat.geometry.transform(proj, map.getProjection());
          map.zoomToExtent(feat.geometry.getBounds());
        }
        $(this).blur();
      });
    },'json');
  }

  /**
   * create the layer switcher
   */
  function createSwitcher() {
    // set the switcher content
    $('#switcher').html(getSwitcherNode(tree,0));
    $('#switcher table.tree').treeTable({
      onNodeShow: function() {
        //updateSwitcherSize();
        var self = $(this);
        if (self.find('div.legendGraphics').length != 0) {
          var name = self.attr('id').replace('legend-','');
          var url = getLayerLegendGraphicUrl(name, true);
          self.find('div.legendGraphics img').attr('src',url);
        }
      },
      onNodeHide: function() {
        //updateSwitcherSize();
      }
    });
    $('#close-menu .ui-icon-close-menu').click(function(){
      $('#menu').hide();
      if(lizMap.checkMobile())
        $('#map-content').show();
      $('#content .ui-icon-open-menu').show();
      $('#toggleLegend').html($('#toggleLegendOn').attr('value'));
      updateContentSize();
    });
    $('#content .ui-icon-open-menu').click(function(){
      $('#menu').show();
      if(lizMap.checkMobile())
        $('#map-content').hide();
      $('#toggleLegend').html($('#toggleMapOn').attr('value'));
      $(this).hide();
      updateContentSize();
    });


  // === Private functions
  var options = {
    childPrefix : "child-of-"
  };

  function childrenOf(node) {
    return $(node).siblings("tr." + options.childPrefix + node[0].id);
  };

  function descendantsOf(node) {
    var descendants = [];
    var children = [];
    if (node && node[0])
      children = childrenOf(node);
    for (var i=0, len=children.length; i<len; i++) {
      descendants.push(children[i]);
      descendants = descendants.concat(descendantsOf([children[i]]));
    }
    return descendants;
  };

  function parentOf(node) {
    var classNames = node[0].className.split(' ');

    for(var key=0; key<classNames.length; key++) {
      if(classNames[key].match(options.childPrefix)) {
        return $(node).siblings("#" + classNames[key].substring(options.childPrefix.length));
      }
    }

    return null;
  };

  function ancestorsOf(node) {
    var ancestors = [];
    while(node = parentOf(node)) {
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };

    // activate checkbox buttons
    $('#switcher button.checkbox').button({
      icons:{primary:'liz-icon-check'},
      text:false
    })
	  .removeClass( "ui-corner-all" )
    .click(function(){
      var self = $(this);
      if (self.attr('aria-disabled')=='true')
        return false;
      var icons = self.button('option','icons');
      var descendants = [self.parents('tr').first()];
      descendants = descendants.concat(descendantsOf($(descendants[0])));
      if (icons.primary != 'liz-icon-check') {
        $.each(descendants,function(i,tr) {
          $(tr).find('button.checkbox').button('option','icons',{primary:'liz-icon-check'});
          $(tr).find('button.checkbox[name="layer"]').each(function(i,b){
            var name = $(b).val();
            var layer = map.getLayersByName(name)[0];
            layer.setVisibility(true);
          });
        });
      } else {
        $.each(descendants,function(i,tr) {
          $(tr).find('button.checkbox').button('option','icons',{primary:''});
          $(tr).find('button.checkbox[name="layer"]').each(function(i,b){
            var name = $(b).val();
            var layer = map.getLayersByName(name)[0];
            layer.setVisibility(false);
          });
        });
        self.button('option','icons',{primary:''});
      }
      var ancestors = ancestorsOf(self.parents('tr').first());
      $.each(ancestors,function(i,tr) {
        tr = $(tr);
        var count = 0;
        var checked = 0;
        var pchecked = 0;
        var trDesc = childrenOf(tr);
        $.each(trDesc,function(j,trd) {
          $(trd).find('button.checkbox').each(function(i,b){
            var icons = $(b).button('option','icons');
            if (icons.primary == 'liz-icon-check')
              checked++;
            else if (icons.primary == 'liz-icon-partial-check')
              pchecked++;
            count++;
          });
        });
        var trButt = tr.find('button.checkbox');
        if (count==checked)
          trButt.button('option','icons',{primary:'liz-icon-check'});
        else if (checked==0 && pchecked==0)
          trButt.button('option','icons',{primary:''});
        else
          trButt.button('option','icons',{primary:'liz-icon-partial-check'});
      });
    });

    // activate link buttons
    $('#switcher button.link').button({
      icons:{primary:'liz-icon-info'},
      text:false
    })
	  .removeClass( "ui-corner-all" )
    .click(function(){
      var self = $(this);
      if (self.attr('aria-disabled')=='true')
        return false;
      var windowLink = self.val();
      // Test if the link is internal
      var mediaRegex = /^(\/)?media\//;
      if(mediaRegex.test(windowLink))
        windowLink = mediaServerURL+'&path=/'+windowLink;
      // Open link in a new window
      window.open(windowLink);
    });

    // activate the close button
    $('#switcherContainer .ui-dialog-titlebar-close').button({
      text:false,
      icons:{primary: "ui-icon-closethick"}
    }).click(function(){
      $('#toolbar button.switcher').button('option','icons',{primary:'liz-icon-switcher-collapsed'});
      $('#switcherContainer').toggle();
      return false;
    });

    var projection = map.projection;

    // get the baselayer select content
    // and adding baselayers to the map
    //var select = '<select class="baselayers">';
    var select = [];
    baselayers.reverse();
    for (var i=0,len=baselayers.length; i<len; i++) {
      var baselayer = baselayers[i]
      baselayer.units = projection.proj.units;
      map.addLayer(baselayer);
      var blConfig = config.layers[baselayer.name];
      /*
      if (blConfig)
        select += '<option value="'+blConfig.name+'">'+blConfig.title+'</option>';
      else
        select += '<option value="'+baselayer.name+'">'+baselayer.name+'</option>';
        */
      if (blConfig)
        select.push('<input type="radio" name="baselayers" value="'+blConfig.name+'"><span class="baselayer-radio-label">'+blConfig.title+'</span></input>');
      else
        select.push('<input type="radio" name="baselayers" value="'+baselayer.name+'"><span class="baselayer-radio-label">'+baselayer.name+'</span></input>');
    }
    //select += '</select>';
    select = select.join('<br/>');

    if (baselayers.length!=0) {
      // active the select element for baselayers
      $('#baselayer-select-input').append(select);
      $('.baselayer-radio-label')
      .css('cursor', 'pointer')
      .click(function(){
        $(this).prev().click();
      });
      $('#baselayer-select-input input').change(function(){
        var val = $(this).val();
        map.setBaseLayer(map.getLayersByName(val)[0]);
        if (val in config.layers)
          $('#baselayer-select .label').html(config.layers[val].title);
        else
          $('#baselayer-select .label').html(val);
        $('#baselayer-select .button').click();
      }).first().attr('checked','true').change();
      $('#baselayer-select .button')
      .attr( "tabIndex", -1 )
      .button({
			   icons: {
				   primary: "ui-icon-triangle-1-e"
				 },
				 text: false
			})
			.removeClass( "ui-corner-all" )
			.addClass( "ui-autocomplete-button ui-button-icon" );
      $('#baselayer-select')
      .css('cursor', 'pointer')
      .click(function() {
        var self = $('#baselayer-select .button');
        var icons = self.button('option','icons');
        if (icons.primary == 'ui-icon-triangle-1-e')
          self.button('option','icons',{primary:'ui-icon-triangle-1-w'});
        else
          self.button('option','icons',{primary:'ui-icon-triangle-1-e'});
        $('#baselayer-select-input').toggle();
      });
    } else {
      // hide elements for baselayers
      //$('#baselayerContainer').hide().prev().hide();
      $('#baselayer-menu').hide();
      map.addLayer(new OpenLayers.Layer.Vector('baselayer',{
        maxExtent:map.maxExtent
       ,maxScale: map.maxScale
       ,minScale: map.minScale
       ,numZoomLevels: map.numZoomLevels
       ,scales: map.scales
       ,projection: map.projection
       ,units: map.projection.proj.units
      }));
    }

    // adding layers to the map
    layers.sort(function(a, b) {
      return a.order > b.order ? 1 : -1;
    });
    layers.reverse();
    for (var i=0,len=layers.length; i<len; i++) {
      var l = layers[i];
      l.units = projection.proj.units;
      l.events.on({
        loadstart: function(evt) {
          $('#layer-'+evt.object.name+' span.loading').addClass('loadstart');
        },
        loadend: function(evt) {
          $('#layer-'+evt.object.name+' span.loading').removeClass('loadstart');
        }
      });
      map.addLayer(l);
      if (!l.isVisible)
        $('#switcher button.checkbox[name="layer"][value="'+l.name+'"]').click();
    }

    $('#switcherContainer').toggle();

    config['locateByLayer'] = {
      'tram_stops':{'fieldName':'name','displayGeom':'True'},
      'Quartiers':{'fieldName':'LIBQUART','displayGeom':'True'}
    };
    if ('locateByLayer' in config) {
      var locateContent = [];
      for (var lname in config.locateByLayer) {
        var lConfig = config.layers[lname];
        var html = '<div class="locate-layer">';
        html += '<select id="locate-layer-'+lname+'">';
        html += '<option>'+lConfig.title+' loading...</option>';
        html += '</select>';
        html += '</div>';
        //constructing the select
        locateContent.push(html);
      }
      $('#locate').html(locateContent.join('<br/>'));
      $.get(wmsServerURL,{
          'SERVICE':'WFS'
         ,'VERSION':'1.0.0'
         ,'REQUEST':'GetCapabilities'
      }, function(xml) {
        $(xml).find('FeatureType').each( function(){
          var self = $(this);
          var lname = self.find('Name').text();
          if (lname in config.locateByLayer) {
            var locate = config.locateByLayer[lname];
            locate['crs'] = self.find('SRS').text();
            new OpenLayers.Projection(locate.crs);
            var bbox = self.find('LatLongBoundingBox');
            locate['bbox'] = [
              parseFloat(bbox.attr('minx'))
             ,parseFloat(bbox.attr('miny'))
             ,parseFloat(bbox.attr('maxx'))
             ,parseFloat(bbox.attr('maxy'))
            ];
          }
        } );
        for (var lname in config.locateByLayer) {
          getLocateFeature(lname);
        }
      },'xml');
      $('#locate-menu').show();
    }
  }

  /**
   * PRIVATE function: createOverview
   * create the overview
   */
  function createOverview() {
    var ovLayer = new OpenLayers.Layer.WMS('overview',wmsServerURL
              ,{layers:'Overview',version:'1.3.0',exceptions:'application/vnd.ogc.se_inimage'
              ,format:'image/png'
              ,transparent:true,dpi:96}
              ,{isBaseLayer:true
               ,gutter:5
               ,buffer:0
              });

    if (config.options.hasOverview) {
      // get and define the max extent
      var bbox = config.options.bbox;
      var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
      var res = extent.getHeight()/90;
      var resW = extent.getWidth()/180;
      if (res <= resW)
        res = resW;

      map.addControl(new OpenLayers.Control.OverviewMap(
        {div: document.getElementById("overviewmap"),
         size : new OpenLayers.Size(220, 110),
         mapOptions:{maxExtent:map.maxExtent
                  ,maxResolution:"auto"
                  ,minResolution:"auto"
        //mieux calculé le coef 64 pour units == "m" et 8 sinon ???
                  //,scales: map.scales == null ? [map.minScale*64] : [Math.max.apply(Math,map.scales)*8]
                  ,scales: [OpenLayers.Util.getScaleFromResolution(res, map.projection.proj.units)]
                  ,projection:map.projection
                  ,units:map.projection.proj.units
                  ,layers:[ovLayer]
                  ,singleTile:true
                  }
        }
      ));
    } else {
      $('#overviewmap').hide();
      $('#overview-bar button').hide();
    }

    /*
    $('#overviewmap .ui-dialog-titlebar-close').button({
      text:false,
      icons:{primary: "ui-icon-closethick"}
    }).click(function(){
      $('#overviewmap').toggle();
      return false;
    });
    */
    $('#overview-bar .button').button({
      text:false,
      icons:{primary: "ui-icon-triangle-1-n"}
    })
	  .removeClass( "ui-corner-all" )
    .click(function(){
      var self = $(this);
      var icons = self.button('option','icons');
      if (icons.primary == 'ui-icon-triangle-1-n')
        self.button('option','icons',{primary:'ui-icon-triangle-1-s'});
      else
        self.button('option','icons',{primary:'ui-icon-triangle-1-n'});
      $('#overviewmap').toggle();
      return false;
    });

    map.addControl(new OpenLayers.Control.Scale(document.getElementById('scaletext')));
    map.addControl(new OpenLayers.Control.ScaleLine({div:document.getElementById('scaleline')}));

    if (config.options.hasOverview)
      if(!mCheckMobile())
        $('#overviewmap').show();
    else
      $('#toolbar button.overview').hide();
  }

  /**
   * PRIVATE function: createNavbar
   * create the navigation bar (zoom, scales, etc)
   */
  function createNavbar() {
    $('#navbar div.slider').height(Math.max(50,map.numZoomLevels*5)).slider({
      orientation:'vertical',
      min: 0,
      max: map.numZoomLevels-1,
      change: function(evt,ui) {
        if (ui.value > map.baseLayer.numZoomLevels-1) {
          $('#navbar div.slider').slider('value',map.getZoom())
          $('#zoom-in-max-msg').show('slide', {}, 500, function() {
            window.setTimeout(function(){$('#zoom-in-max-msg').hide('slide', {}, 500)},1000)
          });
        } else
          map.zoomTo(ui.value);
      }
    });
    $('#navbar button.pan').button({
      text:false,
      icons:{primary: "ui-icon-pan"}
    }).removeClass("ui-corner-all")
    .click(function(){
      var self = $(this);
      if (self.hasClass('ui-state-select'))
        return false;
      $('#navbar button.zoom').removeClass('ui-state-select');
      self.addClass('ui-state-select');
      map.getControlsByClass('OpenLayers.Control.ZoomBox')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.Navigation')[0].activate();
    });
    $('#navbar button.zoom').button({
      text:false,
      icons:{primary: "ui-icon-zoom"}
    }).removeClass("ui-corner-all")
    .click(function(){
      var self = $(this);
      if (self.hasClass('ui-state-select'))
        return false;
      $('#navbar button.pan').removeClass('ui-state-select');
      self.addClass('ui-state-select');
      map.getControlsByClass('OpenLayers.Control.Navigation')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.ZoomBox')[0].activate();
    });
    $('#navbar button.zoom-extent').button({
      text:false,
      icons:{primary: "ui-icon-zoom-extent"}
    }).removeClass("ui-corner-all")
    .click(function(){
      map.zoomToExtent(map.maxExtent);
    });
    $('#navbar button.zoom-in').button({
      text:false,
      icons:{primary: "ui-icon-zoom-in"}
    }).removeClass("ui-corner-all")
    .click(function(){
      if (map.getZoom() == map.baseLayer.numZoomLevels-1)
        $('#zoom-in-max-msg').show('slide', {}, 500, function() {
          window.setTimeout(function(){$('#zoom-in-max-msg').hide('slide', {}, 500)},1000)
        });
      else
        map.zoomIn();
    });
    $('#navbar button.zoom-out').button({
      text:false,
      icons:{primary: "ui-icon-zoom-out"}
    }).removeClass("ui-corner-all")
    .click(function(){
      map.zoomOut();
    });
    $('#navbar div.history button.previous').button({
      text:false,
      icons:{primary: "ui-icon-previous"}
    }).removeClass("ui-corner-all")
    .click(function(){
      var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
      if (ctrl && ctrl.previousStack.length != 0)
        ctrl.previousTrigger();
      if (ctrl && ctrl.previous.active)
        $(this).addClass('ui-state-usable');
      else
        $(this).removeClass('ui-state-usable');
      if (ctrl && ctrl.next.active)
        $('#navbar div.history button.next').addClass('ui-state-usable');
      else
        $('#navbar div.history button.next').removeClass('ui-state-usable');
    });
    $('#navbar div.history button.next').button({
      text:false,
      icons:{primary: "ui-icon-next"}
    }).removeClass("ui-corner-all")
    .click(function(){
      var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
      if (ctrl && ctrl.nextStack.length != 0)
        ctrl.nextTrigger();
      if (ctrl && ctrl.next.active)
        $(this).addClass('ui-state-usable');
      else
        $(this).removeClass('ui-state-usable');
      if (ctrl && ctrl.previous.active)
        $('#navbar div.history button.previous').addClass('ui-state-usable');
      else
        $('#navbar div.history button.previous').removeClass('ui-state-usable');
    });
    map.events.on({
      moveend : function() {
        var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
        if (ctrl && ctrl.previousStack.length > 1)
          $('#navbar div.history button.previous').addClass('ui-state-usable');
        else
          $('#navbar div.history button.previous').removeClass('ui-state-usable');
        if (ctrl && ctrl.nextStack.length > 0)
          $('#navbar div.history button.next').addClass('ui-state-usable');
        else
          $('#navbar div.history button.next').removeClass('ui-state-usable');
      }
    });
  }

  /**
   * PRIVATE function: createToolbar
   * create the tool bar (collapse overview and switcher, etc)
   */
  function createToolbar() {
    $('#toolbar button.switcher').button({
      text:false,
      icons:{primary: "liz-icon-switcher-open"}
    }).click(function(){
      var self = $(this);
      var icons = self.button('option','icons');
      if (icons.primary == 'liz-icon-switcher-open') {
        self.button('option','icons',{primary:'liz-icon-switcher-collapsed'});
        $('#switcherContainer').toggle();
      } else {
        self.button('option','icons',{primary:'liz-icon-switcher-open'});
        $('#switcherContainer').toggle();
      }
      return false;
    });
    $('#toolbar button.overview').button({
      text:false,
      icons:{primary: "liz-icon-overview"}
    }).click(function(){
      $('#overviewmap').toggle();
      return false;
    });
    /*
    $('#toolbar button.print').button({
      text:false,
      icons:{primary: "ui-icon-print"}
    }).click(function(){
      var composer = composers[0];
      var url = wmsServerURL+'&SERVICE=WMS';
      //url += '&VERSION='+capabilities.version+'&REQUEST=GetPrint';
      url += '&VERSION=1.3&REQUEST=GetPrint';
      url += '&FORMAT=pdf&EXCEPTIONS=application/vnd.ogc.se_inimage&TRANSPARENT=true';
      url += '&SRS='+map.projection;
      url += '&DPI=300';
      url += '&TEMPLATE='+composer.getAttribute('name');
      url += '&'+composer.getElementsByTagName('ComposerMap')[0].getAttribute('name')+':extent='+map.getExtent();
      url += '&'+composer.getElementsByTagName('ComposerMap')[0].getAttribute('name')+':rotation=0';
      url += '&'+composer.getElementsByTagName('ComposerMap')[0].getAttribute('name')+':scale='+map.getScale();
      var printLayers = []
      $('#switcher button[name="layer"][aria-disabled="false"]').each(function(i,b){
          b = $(b);
          var icons = b.button('option','icons');
          if (icons.primary == 'liz-icon-check')
            printLayers.push(b.val());
      });
      printLayers.push($('#baselayerContainer select').val());
      printLayers.reverse();
      url += '&LAYERS='+printLayers.join(',');
      window.open(url);
      return false;
    });
    */
    $('#toolbar button.print').hide();

    map.addControl(new OpenLayers.Control.Scale(document.getElementById('scalebar')));
  }


  function addFeatureInfo() {
      var info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: wmsServerURL,
            title: 'Identify features by clicking',
            queryVisible: true,
            infoFormat: 'text/html',
            eventListeners: {
                getfeatureinfo: function(event) {
                    var text = event.text;
                    if (text != ''){
                      if (map.popups.length != 0)
                        map.removePopup(map.popups[0]);
                      OpenLayers.Popup.LizmapAnchored = OpenLayers.Class(OpenLayers.Popup.Anchored,
                        {
                         	'displayClass': 'olPopup lizmapPopup'
                          ,"autoSize": true
//	                        ,"size": new OpenLayers.Size(200, 200)
//	                        ,"minSize": new OpenLayers.Size(300, 300)
	                        ,"maxSize": new OpenLayers.Size(500, 500)
	                        ,"keepInMap": true
                         	,'contentDisplayClass': 'olPopupContent lizmapPopupContent'
                        }
                      );
                      var popup = new OpenLayers.Popup.LizmapAnchored(
                        "liz_layer_popup",
                        map.getLonLatFromPixel(event.xy),
                        null,
                        text,
                        null,
                        true,
                        function() {
                          map.removePopup(this);
                          if(mCheckMobile()){
                            $('#navbar').show();
                            $('#overview-box').show();
                          }


                        }
                        );
                      popup.panMapIfOutOfView = true;
//                      popup.autoSize = true; // disabled is better
//                      popup.size = new OpenLayers.Size(400, 400);
                      map.addPopup(popup);
                      var contentDivHeight = 0;
                      $('#liz_layer_popup_contentDiv').children().each(function(i,e) {
                        contentDivHeight += $(e).height();
                      });
                      if($('#liz_layer_popup').height()<contentDivHeight) {
                        $('#liz_layer_popup .olPopupCloseBox').css('right','14px');
                      }
                      // Hide navbar and overview in mobile mode
                      if(mCheckMobile()){
                        $('#navbar').hide();
                        $('#overview-box').hide();
                      }


                    }
                }
            }
     });
     info.findLayers = function() {
        var candidates = this.layers || this.map.layers;
        var layers = [];
        var layer, url;
        for(var i=0, len=candidates.length; i<len; ++i) {
            layer = candidates[i];
            if(layer instanceof OpenLayers.Layer.WMS  &&
               (!this.queryVisible || (layer.getVisibility() && layer.calculateInRange()))) {
                 var configLayer = config.layers[layer.params['LAYERS']];
                 if( configLayer && configLayer.popup && configLayer.popup == 'True'){
                    url = OpenLayers.Util.isArray(layer.url) ? layer.url[0] : layer.url;
                    // if the control was not configured with a url, set it
                    // to the first layer url
                    if(this.drillDown === false && !this.url) {
                        this.url = url;
                    }
                    if(this.drillDown === true || this.urlMatches(url)) {
                        layers.push(layer);
                    }

                 }
            }
        }
        return layers;
     };
     map.addControl(info);
     info.activate();
     return info;
  }

  /**
   * PRIVATE function: parseData
   * parsing capability
   *
   * Parameters:
   * aData - {String} the WMS capabilities
   *
   * Returns:
   * {Boolean} the capability is OK
   */
  function parseData(aData) {
    var format =  new OpenLayers.Format.WMSCapabilities({version:'1.3.0'});
    var html = "";
    capabilities = format.read(aData);

    var format = new OpenLayers.Format.XML();
    composers = format.read(aData).getElementsByTagName('ComposerTemplate');

    var capability = capabilities.capability;
    if (!capability) {
      $('#map').html('SERVICE NON DISPONIBLE!');
      return false;
    }
    return true;
  }


  /**
   * PRIVATE function: mCheckMobile
   * Check wether in mobile context.
   *
   *
   * Returns:
   * {Boolean} True if in mobile context.
   */
  function mCheckMobile() {
    var minMapSize = 450;
    var w = $('body').parent()[0].offsetWidth;
    if($.browser.msie)
        w = $('body').width();
    var leftW = w - minMapSize;
    if(leftW < minMapSize || w < minMapSize)
        return true;
    return false;
  }



  // creating the lizMap object
  var obj = {
    /**
     * Property: map
     * {<OpenLayers.Map>} The map
     */
    map: null,
    /**
     * Property: layers
     * {Array(<OpenLayers.Layer>)} The layers
     */
    layers: null,
    /**
     * Property: baselayers
     * {Array(<OpenLayers.Layer>)} The base layers
     */
    baselayers: null,
    /**
     * Property: events
     * {<OpenLayers.Events>} An events object that handles all
     *                       events on the lizmap
     */
    events: null,
    /**
     * Property: config
     * {Object} The map config
     */
    config: null,
    /**
     * Property: dictionnary
     * {Object} The map dictionnary
     */
    dictionary: null,
    /**
     * Property: tree
     * {Object} The map tree
     */
    tree: null,

    /**
     * Method: checkMobile
     */
    checkMobile: function() {
      return mCheckMobile();
    },

    /**
     * Method: init
     */
    init: function() {
      var self = this;
      //get config
      $.getJSON(cfgUrl,function(cfgData) {
        config = cfgData;
        config.options.hasOverview = false;

      //get dictionnary
      $.getJSON(dictionaryUrl,function(dictData) {
        dictionary = dictData;

         //get capabilities
        $.get(wmsServerURL,{SERVICE:'WMS',REQUEST:'GetCapabilities',VERSION:'1.3.0'},function(data) {
          //parse capabilities
          if (!parseData(data))
            return true;

          //set title and abstract coming from capabilities
          document.title = capabilities.title ? capabilities.title : capabilities.service.title;
          $('#title').html('<h1>'+(capabilities.title ? capabilities.title : capabilities.service.title)+'</h1>');
          //$('#abstract').html(capabilities.abstract ? capabilities.abstract : capabilities.service.abstract);
          $('#abstract').html(capabilities.abstract ? capabilities.abstract : '');

          // get and analyse tree
          var capability = capabilities.capability;
          var firstLayer = capability.nestedLayers[0];
          getLayerTree(firstLayer,tree);
          analyseNode(tree);
          self.config = config;
          self.tree = tree;
          self.events.triggerEvent("treecreated", self);
          if(self.checkMobile()){
            $('#menu').hide();
            $('#map-content').css('margin-left','0');
          }

          // create the map
          createMap();
          self.map = map;
          self.layers = layers;
          self.baselayers = baselayers;
          self.events.triggerEvent("mapcreated", self);

          // create the switcher
          createSwitcher();
          self.events.triggerEvent("layersadded", self);

          // initialize the map
          map.zoomToExtent(map.maxExtent);
          updateContentSize();
          map.events.triggerEvent("zoomend",{"zoomChanged": true});

          // create overview if 'Overview' layer
          createOverview();

          // create navigation and toolbar
          createNavbar();
          //createToolbar();

          var info = addFeatureInfo();
          $('#navbar div.slider').slider("value",map.getZoom());
          map.events.on({
            zoomend : function() {
              $('#switcher table.tree tr.legendGraphics.initialized').each(function() {
                var self = $(this);
                var name = self.attr('id').replace('legend-','');
                var url = getLayerLegendGraphicUrl(name, true);
                self.find('div.legendGraphics img').attr('src',url);
              });
            }
          });
          self.events.triggerEvent("uicreated", self);

          $('body').css('cursor', 'auto');
          $('#loading').dialog('close');
        }, "text");
      });
      });
    }
  };
  // initializing the lizMap events
  obj.events = new OpenLayers.Events(
      obj, null,
      ['treecreated','mapcreated','layersadded','uicreated'],
      true,
      {includeXY: true}
    );
  return obj;
}();
/*
 * it's possible to add event listener
 * before the document is ready
 * but after this file
 */
lizMap.events.on({
    'treecreated':function(evt){
       //console.log('treecreated');
       if ((('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') ||
           (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') ||
           (('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') ||
           (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') ||
           (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') ||
           (('googleTerrain' in evt.config.options) && evt.config.options.googleTerrain == 'True')) {
         var proj = evt.config.options.projection;
         Proj4js.defs[proj.ref]=proj.proj4;
         var projection = new OpenLayers.Projection(proj.ref);
         var projOSM = new OpenLayers.Projection('EPSG:900913');
         proj.ref = 'EPSG:900913';
         proj.proj4 = Proj4js.defs['EPSG:900913'];

         var bbox = evt.config.options.bbox;
         var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
         extent = extent.transform(projection,projOSM);
         bbox = extent.toArray();

         evt.config.options.projection = proj;
         evt.config.options.bbox = bbox;
         evt.config.options.zoomLevelNumber = 16;
         if ((('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') ||
             (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True'))
           evt.config.options.zoomLevelNumber = 19;
         if ((('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') ||
             (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True'))
           evt.config.options.zoomLevelNumber = 20;
         if ((('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True'))
           evt.config.options.zoomLevelNumber = 21;
         evt.config.options.maxScale = 591659030.3224756;
         evt.config.options.minScale = 2257.0000851534865;
         evt.config.options.mapScales = [];
       }

    }
   ,'mapcreated':function(evt){
       //console.log('mapcreated');
       //adding baselayers
       var maxExtent = new OpenLayers.Bounds(OpenLayers.Projection.defaults['EPSG:3857'].maxExtent);
       if (('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') {
         evt.map.allOverlays = false;
         var osm = new OpenLayers.Layer.OSM('osm');
         osm.maxExtent = maxExtent;
         var osmCfg = {
           "name":"osm"
             ,"title":"OpenStreetMap"
         };
         evt.config.layers['osm'] = osmCfg;
         evt.baselayers.push(osm);
       }
       if (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') {
         evt.map.allOverlays = false;
         var mapquest = new OpenLayers.Layer.OSM('mapquest',
            ["http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
             "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
             "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
             "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"]
             , {numZoomLevels: 19}
            );
         mapquest.maxExtent = maxExtent;
         var mapquestCfg = {
           "name":"mapquest"
          ,"title":"MapQuest OSM"
         };
         evt.config.layers['mapquest'] = mapquestCfg;
         evt.baselayers.push(mapquest);
       }
       try {
       if (('googleTerrain' in evt.config.options) && evt.config.options.googleTerrain == 'True') {
         var gphy = new OpenLayers.Layer.Google(
             "Google Terrain",
             {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 16}
             );
         gphy.maxExtent = maxExtent;
         var gphyCfg = {
           "name":"gphy"
          ,"title":"Google Terrain"
         };
         evt.config.layers['gphy'] = gphyCfg;
         evt.baselayers.push(gphy);
         evt.map.allOverlays = false;
       }
       if (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') {
         var gsat = new OpenLayers.Layer.Google(
             "Google Satellite",
             {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 21}
             );
         gsat.maxExtent = maxExtent;
         var gsatCfg = {
           "name":"gsat"
          ,"title":"Google Satellite"
         };
         evt.config.layers['gsat'] = gsatCfg;
         evt.baselayers.push(gsat);
         evt.map.allOverlays = false;
       }
       if (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') {
         var ghyb = new OpenLayers.Layer.Google(
             "Google Hybrid",
             {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
             );
         ghyb.maxExtent = maxExtent;
         var ghybCfg = {
           "name":"ghyb"
          ,"title":"Google Hybrid"
         };
         evt.config.layers['ghyb'] = ghybCfg;
         evt.baselayers.push(ghyb);
         evt.map.allOverlays = false;
       }
       if (('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') {
         var gmap = new OpenLayers.Layer.Google(
             "Google Streets", // the default
             {numZoomLevels: 20}
             );
         gmap.maxExtent = maxExtent;
         var gmapCfg = {
           "name":"gmap"
          ,"title":"Google Streets"
         };
         evt.config.layers['gmap'] = gmapCfg;
         evt.baselayers.push(gmap);
         evt.map.allOverlays = false;
       }
       } catch(e) {
         //problems with google
         var myError = e;
         //console.log(myError);
       }

     }
   ,'uicreated':function(evt){
  //alert('uicreated')

    // Toggle legend
    $('#toggleLegend').click(function(){
      if ($('#menu').is(':visible')) {
        $('.ui-icon-close-menu').click();
        $('#metadata').hide();
      }
      else{
        $('.ui-icon-open-menu').click();
        $('#metadata').hide();
      }
    });

   }
});

$(document).ready(function () {
  // start waiting
  $('body').css('cursor', 'wait');
  $('#loading').dialog({
    modal: true
    , draggable: false
    , resizable: false
    , closeOnEscape: false
    , dialogClass: 'liz-dialog-wait'
  })
  .parent().removeClass('ui-corner-all')
  .children('.ui-dialog-titlebar').removeClass('ui-corner-all');
  // configurate OpenLayers
  OpenLayers.DOTS_PER_INCH = 96;
  // initialize LizMap
  lizMap.init();
});
