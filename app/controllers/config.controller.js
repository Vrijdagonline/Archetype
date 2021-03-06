angular.module("umbraco").controller("Imulus.ArchetypeConfigController", function ($scope, $http, assetsService, propertyEditorService) {
    
    //$scope.model.value = "";
    //console.log($scope.model.value); 

    var newPropertyModel = '{alias: "", remove: false, collapse: false, label: "", helpText: "", view: "", value: "", config: ""}';
    var newFieldsetModel = '{alias: "", remove: false, collapse: false, labelTemplate: "", tooltip: "", icon: "", label: "", headerText: "", footerText: "", properties:[' + newPropertyModel + ']}';
    var defaultFieldsetConfigModel = eval("({showAdvancedOptions: false, hideFieldsetToolbar: false, enableMultipleFieldsets: false, hideFieldsetControls: false, hideFieldsetLabels: false, hidePropertyLabel: false, maxFieldsets: null, fieldsets: [" + newFieldsetModel + "]})");
    
    $scope.model.value = $scope.model.value || defaultFieldsetConfigModel;
    
    initConfigRenderModel();

    //get the available views
    propertyEditorService.getViews().then(function(data){
        $scope.availableViews = data;
    });
      
    $scope.sortableOptions = {
        axis: 'y',
        cursor: "move",
        handle: ".handle",
        update: function (ev, ui) {

        },
        stop: function (ev, ui) {

        }
    };
    
    $scope.focusFieldset = function(fieldset){
        var iniState;
        
        if(fieldset)
        {
            iniState = fieldset.collapse;
        }
        
        _.each($scope.archetypeConfigRenderModel.fieldsets, function(fieldset){
            if($scope.archetypeConfigRenderModel.fieldsets.length == 1 && fieldset.remove == false)
            {
                fieldset.collapse = false;
                return;
            }

            if(fieldset.label)
            {
                fieldset.collapse = true;
            }
            else
            {
                fieldset.collapse = false;
            }
        });
        
        if(iniState)
        {
            fieldset.collapse = !iniState;
        }
    }
    //ini
    $scope.focusFieldset();

    $scope.focusProperty = function(properties, property){
        var iniState;
        
        if(property)
        {
            iniState = property.collapse;
        }

        _.each(properties, function(property){
            if(property.label)
            {
                property.collapse = true;
            }
            else
            {
                property.collapse = false;
            }
        });
        
        if(iniState)
        {
            property.collapse = !iniState;
        }
    }
    
    //setup JSON.stringify helpers
    $scope.archetypeConfigRenderModel.toString = stringify;
    
    //encapsulate stringify (should be built into browsers, not sure of IE support)
    function stringify() {
        return JSON.stringify(this);
    }
    
    //watch for changes
    $scope.$watch('archetypeConfigRenderModel', function (v) {
        //console.log(v);
        if (typeof v === 'string') {     
            $scope.archetypeConfigRenderModel = JSON.parse(v);
            $scope.archetypeConfigRenderModel.toString = stringify;
        }
    }, true);
    
    //helper that returns if an item can be removed
    $scope.canRemoveFieldset = function ()
    {   
        return countVisibleFieldset() > 1;
    }

    //helper that returns if an item can be sorted
    $scope.canSortFieldset = function ()
    {
        return countVisibleFieldset() > 1;
    }
    
    //helper that returns if an item can be removed
    $scope.canRemoveProperty = function (fieldset)
    {   
        return countVisibleProperty(fieldset) > 1;
    }

    //helper that returns if an item can be sorted
    $scope.canSortProperty = function (fieldset)
    {
        return countVisibleProperty(fieldset) > 1;
    }
    
    //helper to count what is visible
    function countVisibleFieldset()
    {
        var count = 0;

        _.each($scope.archetypeConfigRenderModel.fieldsets, function(fieldset){
            if (fieldset.remove == false) {
                count++;
            }
        });

        return count;
    }
    
    function countVisibleProperty(fieldset)
    {
        var count = 0;

        for (var i in fieldset.properties) {
            if (fieldset.properties[i].remove == false) {
                count++;
            }
        }

        return count;
    }
   
    //handles a fieldset add
    $scope.addFieldsetRow = function ($index, $event) {
        $scope.archetypeConfigRenderModel.fieldsets.splice($index + 1, 0, eval("(" + newFieldsetModel + ")"));
        $scope.focusFieldset();
    }
    
    //rather than splice the archetypeConfigRenderModel, we're hiding this and cleaning onFormSubmitting
    $scope.removeFieldsetRow = function ($index) {
        if ($scope.canRemoveFieldset()) {
            if (confirm('Are you sure you want to remove this?')) {
                $scope.archetypeConfigRenderModel.fieldsets[$index].remove = true;
            }
        }
    }
    
    //handles a property add
    $scope.addPropertyRow = function (fieldset, $index) {
        fieldset.properties.splice($index + 1, 0, eval("(" + newPropertyModel + ")"));
    }
    
    //rather than splice the archetypeConfigRenderModel, we're hiding this and cleaning onFormSubmitting
    $scope.removePropertyRow = function (fieldset, $index) {
        if ($scope.canRemoveProperty(fieldset)) {
            if (confirm('Are you sure you want to remove this?')) {
                fieldset.properties[$index].remove = true;
            }
        }
    }
    
    //helper to ini the render model
    function initConfigRenderModel()
    {
        $scope.archetypeConfigRenderModel = $scope.model.value;

        _.each($scope.archetypeConfigRenderModel.fieldsets, function(fieldset){

            fieldset.remove = false;

            if(fieldset.label)
            {
                fieldset.collapse = true;
            }

            _.each(fieldset.properties, function(fieldset){
                fieldset.remove = false;
            });
        });
    }
    
    //sync things up on save
    $scope.$on("formSubmitting", function (ev, args) {
        syncModelToRenderModel();
    });
    
    //helper to sync the model to the renderModel
    function syncModelToRenderModel()
    {
        $scope.model.value = $scope.archetypeConfigRenderModel;
        var fieldsets = [];
        
        _.each($scope.archetypeConfigRenderModel.fieldsets, function(fieldset){
            //check fieldsets
            if (!fieldset.remove) {
                fieldsets.push(fieldset);
                
                var properties = [];

                _.each(fieldset.properties, function(property){
                   if (!property.remove) {
                        properties.push(property);
                    } 
                });

                fieldset.properties = properties;
            }
        });
        
        $scope.model.value.fieldsets = fieldsets;
    }
    
    //archetype css
    assetsService.loadCss("/App_Plugins/Archetype/css/archetype.css");
});
