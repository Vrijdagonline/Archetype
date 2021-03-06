﻿angular.module("umbraco").directive('archetypeProperty', function ($compile, $http) {
    
    function getFieldsetByAlias(fieldsets, alias)
    {
        for (var i in fieldsets)
        {
            if (fieldsets[i].alias == alias)
            {
                return fieldsets[i];
            }
        }
    }

    function getPropertyIdByAlias(properties, alias)
    {
        for (var i in properties)
        {
            if (properties[i].alias == alias) {
                return i;
            }
        }
    }

    var linker = function (scope, element, attrs) {
         
        var configFieldsetModel = getFieldsetByAlias(scope.archetypeConfig.fieldsets, scope.fieldset.alias);

        var view = configFieldsetModel.properties[scope.propertyConfigIndex].view;
        var label = configFieldsetModel.properties[scope.propertyConfigIndex].label;
        var config = configFieldsetModel.properties[scope.propertyConfigIndex].config;
        var alias = configFieldsetModel.properties[scope.propertyConfigIndex].alias;
        var defaultValue = configFieldsetModel.properties[scope.propertyConfigIndex].value;
        
        //try to convert the config to a JS object
        if(config && typeof config == 'string'){
            try{
                if(scope.archetypeConfig.developerMode == '1'){
                    console.log("Trying to eval config: " + config); 
                }
                config = eval("(" + config + ")");
            }
            catch(exception)
            {
                if(scope.archetypeConfig.developerMode == '1'){
                    console.log("Failed to eval config."); 
                }
            }
        }

        if(config && scope.archetypeConfig.developerMode == '1'){
            console.log("Config post-eval: " + config); 
        }

        //try to convert the defaultValue to a JS object
        if(defaultValue && typeof defaultValue == 'string'){
            try{
                if(scope.archetypeConfig.developerMode == '1'){
                    console.log("Trying to eval default value: " + defaultValue); 
                }
                defaultValue = eval("(" + defaultValue + ")");
            }
            catch(exception)
            {
                if(scope.archetypeConfig.developerMode == '1'){
                    console.log("Failed to eval defaultValue."); 
                }
            }
        }

        if(defaultValue && scope.archetypeConfig.developerMode == '1'){
            console.log("Default value post-eval: " + defaultValue); 
        }

        if (view)
        {
            $http.get(view).success(function (data) {
                if (data) {
                    if (scope.archetypeConfig.developerMode == '1')
                    {
                        console.log(scope);
                    }

                    var rawTemplate = data;

                    //define the initial model and config
                    scope.model = {};
                    scope.model.config = {};

                    //ini the property value after test to make sure a prop exists in the renderModel
                    var renderModelPropertyIndex = getPropertyIdByAlias(scope.archetypeRenderModel.fieldsets[scope.fieldsetIndex].properties, alias);

                    if (!renderModelPropertyIndex)
                    {
                        scope.archetypeRenderModel.fieldsets[scope.fieldsetIndex].properties.push(eval("({alias: '" + alias + "', value:'" + defaultValue + "'})"));
                        renderModelPropertyIndex = getPropertyIdByAlias(scope.archetypeRenderModel.fieldsets[scope.fieldsetIndex].properties, alias);
                    }
                    scope.model.value = scope.archetypeRenderModel.fieldsets[scope.fieldsetIndex].properties[renderModelPropertyIndex].value;

                    //set the config from the prevalues
                    scope.model.config = config;

                    //some items need an alias
                    scope.model.alias = "scope-" + scope.$id;

                    //watch for changes since there is no two-way binding with the local model.value
                    scope.$watch('model.value', function (newValue, oldValue) {
                        scope.archetypeRenderModel.fieldsets[scope.fieldsetIndex].properties[renderModelPropertyIndex].value = newValue;
                    });

                    element.html(rawTemplate).show();
                    $compile(element.contents())(scope);
                }
            });
        }
    }

    return {
        restrict: "E",
        rep1ace: true,
        link: linker,
        scope: {
            property: '=',
            propertyConfigIndex: '=',
            archetypeConfig: '=',
            fieldset: '=',
            fieldsetIndex: '=',
            archetypeRenderModel: '='
        }
    }
});