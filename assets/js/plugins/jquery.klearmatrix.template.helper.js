(function($) {
	
	$.klearmatrix = $.klearmatrix || {};
	$.klearmatrix.template  = $.klearmatrix.template || {};
	
	$.klearmatrix.template.helper = {
			debug : function() {
				console.log(arguments);
				return '';
			},
			cleanValue : function(_value,ifNull) {
				ifNUll = (typeof ifNULL == 'undefined')? 'no disponible':ifNUll;									
				if(typeof _value == 'undefined') {
					return ifNUll;
				}
				
				return $('<div/>').text(_value).html();
			},
			getEditDataForField : function(value,column,isNew) {
				
				var extraConfig = column.config || false;
				var properties = column.properties || false;
				if (true === isNew) {
					var _value = '';
				} else {
					if (typeof value != 'object') {

						var _value = this.cleanValue(value,'');

					} else {
						// Casos de multiselect y multiLang
						console.log(value,this.getValuesFromSelectColumn(column));
						var _value = this.getValuesFromSelectColumn(column);
					}
				}
				

				if ( (this.data) && (this.data.parentItem == column.id) ) {
					column.readonly = true;
					_value = this.data.parentId;
				}
				
				var randIden = (this.data && this.data.randIden)? this.data.randIden:Math.random(10000);
				
				var fieldData = {
						_elemIden: column.id + randIden,
						_elemName: column.id,
						_readonly: column.readonly? true:false,
						_dataConfig : extraConfig,
						_properties : properties,
						_fieldValue : _value
				};

				
				var node = $("<div />");
				
				if (column.multilang) {
					var mlData = [];
					
					for (var i in this.data.langs) {
						
						var lang = this.data.langs[i];
						var _curValue = isNew? '':this.cleanValue(fieldData._fieldValue[lang] ,'');
						
						var _curFieldData = {
							_elemIden: column.id + lang + randIden,
							_elemName : column.id + lang,
							_readonly: column.readonly? true:false,
							_dataConfig : extraConfig,
							_properties : properties,
							_fieldValue: _curValue
						};
							
						var _node = $("<div />");
						
						$.tmpl(this.getTemplateNameForType(column.type),_curFieldData).appendTo(_node);
						mlData.push({
							_iden: _curFieldData._elemIden,
							_lang : lang,
							_field : _node.html()
						});
						
						
					}
					
					$.tmpl('klearmatrixMultiLangField',mlData).appendTo(node);
					
				} else {
					
					$.tmpl(this.getTemplateNameForType(column.type),fieldData).appendTo(node);
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
			getValuesFromSelectColumn : function(column,idx) {
				switch(column.type){
					case 'select':
						if (column.config.values['__className']) {
							delete column.config.values['__className'];
						}
						if ( (typeof idx != 'undefined') && column.config.values[idx] ){
							return column.config.values[idx];
						} else {
							return column.config.values;
						}
					break;
					case 'multiselect':
						if (column.config.values['__className']) {
							delete column.config.values['__className'];
						}
						if ( (typeof idx != 'undefined') && column.config.values[idx] ){
							return column.config.values[idx];
						} else {
							return column.config.values;
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
					switch(column.type) {
						default:
							return "no disponible";
					}
					
				} else {
					switch(column.type){
						case 'select':
							var _curVal = this.cleanValue(values[column.id]);
							if (this.getValuesFromSelectColumn(column)[_curVal]) {
								return this.getValuesFromSelectColumn(column)[_curVal];
							} else {
								return '';
							}
						break;
						case 'multiselect':
							
							var returnValue = [];
							for(var i in values[column.id]['relStruct']) {
								var relId = values[column.id]['relStruct'][i]['relatedId'];
								if (this.getValuesFromSelectColumn(column)[relId]) {
									returnValue.push(this.getValuesFromSelectColumn(column)[relId]);
								}
							}
							if (returnValue.length == 0) {
								return '<em>' + $.translate('no hay elementos asociados') + '</em>';
							} else {
								return returnValue.join(', ');
							}
							
						break;
						case 'file':
							return this.cleanValue(values[column.id]['name'])
						break;
						default:
							if (column.multilang) {
							
								return this.getMultiLangValue(values[column.id],this.data.langs,this.data.defaultLang);
							
							} else {
							
								return this.cleanValue(values[column.id]);
							}
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
			getTitle : function(title,idx) {
				
				if (false !== idx) {
					var defaultColumn = this.data.columns[0];
				
					for(var i in this.data.columns) {
						if (this.data.columns[i].default) {
							var defaultColumn = this.data.columns[i];
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

				return title
						.replace(/\%parent\%/,this.cleanValue(this.data.parentIden))
						.replace(/\%item\%/,this.cleanValue(defaultValue));
				
				
			}
	
	};
	
})(jQuery);