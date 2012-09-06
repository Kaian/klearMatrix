(function ($) {

    $.klearmatrix = $.klearmatrix || {};
    $.klearmatrix.template  = $.klearmatrix.template || {};

    var __namespace__ = "klearmatrix.templatehelper";

    $.klearmatrix.template.helper = {

        debug : function() {
            console.log(arguments);
            return '';
        },

        cleanValue : function(_value, ifNull, pattern) {

            if (typeof ifNull == 'undefined') {

                ifNull = '';
            }

            if (pattern && !ifNull.match(pattern)) {

                ifNull = '';
            }

            if(typeof _value == 'undefined' || !_value || _value == '') {

                return ifNull;
            }

            return $('<div/>').text(_value).html();
        },

        getEditDataForField : function(value, column, isNew) {
            var extraConfig = column.config || false;
            var properties = column.properties || false;
            var customErrors = column.errors || false;
            var _value = '';
            
            if (true !== isNew) {

                if (typeof value != 'object' && !column.dirty) {
                    var pattern = column.properties && column.properties.pattern || '';
                    _value = this.cleanValue(value,'', pattern);

                } else {

                    _value = value;
                }
            }

            // Tengo prisa...
            if (column.disabledOptions) {

                if (column.disabledOptions['valuesCondition']) {
                    if (column.disabledOptions['valuesCondition'] == 'null') {
                        column.disabledOptions['valuesCondition'] = null;
                    }

                    if (_value == column.disabledOptions['valuesCondition']) {
                        return column.disabledOptions['label'];
                    }
                }
            }

            if ( (this.data) && (this.data.parentItem == column.id) ) {
                column.readonly = true;
                _value = this.data.parentId;
            }

            var randIden = (this.data && this.data.randIden)? this.data.randIden:Math.round(Math.random(10000)*10000);

            var fieldData = {
                    _elemIden: column.id + randIden,
                    _elemName: column.id,
                    _readonly: column.readonly? true:false,
                    _dataConfig : extraConfig,
                    _properties : properties,
                    _fieldValue : _value,
                    _errors : customErrors
            };

            var node = $("<div />");

            var _templateHelpers = {
                dataParser: function (attribute, value) {

                    attribute = attribute.charAt(0).toLowerCase() + attribute.substr(1).replace(/[A-Z]/g,function(s) {
                        return "-"+s.toLowerCase();
                    });
                    return  attribute;
                }
            };

            if (column.multilang) {
                var mlData = [];
                for (var i in this.data.langs) {

                    var lang = this.data.langs[i];
                    var _curValue = isNew? '': this.cleanValue(fieldData._fieldValue[lang] );

                    var _curFieldData = {
                        _elemIden: column.id + lang + randIden,
                        _elemName : column.id + lang,
                        _readonly: column.readonly? true:false,
                        _dataConfig : extraConfig,
                        _properties : properties,
                        _fieldValue: _curValue,
                        _errors : customErrors,
                        _multilang : true,
                        _locale: this.data.langDefinitions[lang]['locale']
                    };

                    var _node = $("<div />");
                    $.tmpl(this.getTemplateNameForType(column.type), _curFieldData, _templateHelpers).appendTo(_node);

                    mlData.push({
                        _iden: _curFieldData._elemIden,
                        _lang : lang,
                        _field : _node.html()
                    });
                }
                $.tmpl('klearmatrixMultiLangField', mlData).appendTo(node);

            } else {

                $.tmpl(this.getTemplateNameForType(column.type), fieldData, _templateHelpers).appendTo(node);
            }

            return node.html();

        },

        getColumnName : function(columns, columnId) {

            for(var idx in columns) {
                if (columns[idx].id == columnId) {
                    return columns[idx].name;
                }
            }
            return false;

        },

        getColumn : function(columns, columnId) {

            for(var idx in columns) {
                if (columns[idx].id == columnId) {
                    return columns[idx];
                }
            }
            return false;

        },

        getIndex : function(values,idx) {
            if (!values[idx]) return 'error';
            return values[idx];
        },

        getMultiLangValue : function(value,langs,defaultLang) {
            var retItem = $("<div />");
            for (var i in langs) {
                var mlData = {
                        _lang : langs[i],
                        _value : this.cleanValue(value[langs[i]]),
                        _default : (langs[i] == defaultLang)
                };
                _compiled = $.tmpl('klearmatrixMultiLangList',mlData);
                retItem.append(_compiled);

            }

            return retItem.html();
        },

        getValuesFromSelectColumn : function(column, idx) {
            switch (column.type){
                case 'select':
                    var ret = {};
                    for (var index in column.config.values) {
                        ret[column.config.values[index].key] = column.config.values[index].item;
                    }
                    if ( (typeof idx != 'undefined') && typeof ret[idx] != 'undefined'){
                        return ret[idx];
                    } else {
                        return ret;
                    }
                break;
                case 'multiselect':
                    if (column.config.values['__className']) {
                        delete column.config.values['__className'];
                    }
                    var ret = {};
                    for (var index in column.config.values) {
                        ret[column.config.values[index].key] = column.config.values[index].item;
                    }
                    // Multiselect bugs ahead!!
                    if ( (typeof idx != 'undefined') && column.config.values[idx] ){
                        return ret[idx];
                    } else {
                        return ret;
                    }

                break;
            }
            if (typeof idx != 'undefined') {
                return this.cleanValue(idx);
            } else {
                return false;
            }
        },

        getIndexFromColumn : function(values,column) {

            if (typeof values[column.id] == 'undefined') {

                return '';

            } else {
                switch(column.type){

                    case 'select':

                        var _curVal = values[column.id];

                        if (this.getValuesFromSelectColumn(column)[_curVal]) {

                            return this.getValuesFromSelectColumn(column)[_curVal];
                        }

                        return '';
                        break;

                    case 'multiselect':

                        var fixedValues = this.getValuesFromSelectColumn(column);
                        var returnValue = [];

                        for(var i in values[column.id]['relStruct']) {

                            var relId = values[column.id]['relStruct'][i]['relatedId'];

                            if (fixedValues[relId]) {

                                returnValue.push(fixedValues[relId]);
                            }
                        }

                        if (returnValue.length == 0) {

                            return '<em>' + $.translate('There are not associated elements', [__namespace__]) + '</em>';
                        }

                        return returnValue.join(', ');
                        break;

                    case 'file':

                        return this.cleanValue(values[column.id]['name'])
                        break;

                    default:

                        if (column.multilang) {

                            return this.getMultiLangValue(values[column.id],this.data.langs,this.data.defaultLang);
                        }

                        if (column.dirty) {

                            return values[column.id];
                        }

                        return this.cleanValue(values[column.id]);
                        break;
                }
            }
        },

        getTemplateNameForType : function(type) {
            return 'klearMatrixFields' + type;
        },

        getTemplateForType : function(type) {
            return $.template[this.getTemplateNameForType(type)];
        },

        getPaginatorTemplate : function() {
            return $.template['klearmatrixPaginator'];
        },

        getTitle : function(title,idx,replaceParentPerItem) {
            if (false !== idx) {

                var count = false;
                var defaultColumn;

                for(var i in this.data.columns) {
                    if (count === false) {
                        defaultColumn = this.data.columns[i];
                        count = true;
                    }

                    if (this.data.columns[i]['default'] ) {
                        defaultColumn = this.data.columns[i];
                        break;
                    }
                }

                var defaultValue = this.data.values[idx][defaultColumn.id];

                if (defaultColumn.multilang) {
                    defaultValue = defaultValue[this.data.defaultLang];
                }

            } else {
                var defaultColumn = '';
            }

            // Si el método es invocado con replaceParentPerItem, éste viene de un listado
            // Las opciones cogen el title|label de su destino; en este caso, el parent será el item
            var parentValue = (replaceParentPerItem)?
                                    this.cleanValue(defaultValue) :
                                    this.cleanValue(this.data.parentIden);

            return title
                    .replace(/\%parent\%/,parentValue)
                    .replace(/\%item\%/,this.cleanValue(defaultValue));


        },

        mustShowOptionColum : function(option, value) {

            return true;
        }
    };

})(jQuery);