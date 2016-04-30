
Ext.define('CA.techservices.filter.ArtifactSearchField', {
    alias: 'widget.tsartifactsearchfield',
    extend: 'Rally.ui.TextField',
    requires: [
        'Rally.data.wsapi.Filter'
    ],

    fieldLabel: 'Search',
    emptyText: 'Text Search...',

    config: {
        model: undefined,
        context: undefined,
        fieldLabel: null
    },

    _isValidField: function(model, fieldNames) {
        var validFields = _.pluck(model.getFields(), 'name');
        return fieldNames.every(function(fieldName) {
            return _.contains(validFields, fieldName);
        });
    },
    
    getFilter: function() {
        var value = this.lastValue;
        if (!Ext.isEmpty(value)) {
            var filters = [],
                models = [this.model];

            var onlyNumbers = new RegExp('^(\\d+)$');
            if (onlyNumbers.test(value) && this._isValidField(this.model, ['FormattedID'])) {
                filters.push({
                    property: 'FormattedID',
                    operator: 'contains',
                    value: value
                });
            }

            _.each(models, function(model) {
                var prefixPlusNumbers = new RegExp(Ext.String.format('^({0}\\d+)$', model.idPrefix), 'i');
                if (prefixPlusNumbers.test(value) && model.isArtifact()) {
                    filters.push(
                        Rally.data.wsapi.Filter.and([
                            {
                                property: 'TypeDefOid',
                                operator: '=',
                                value: model.typeDefOid
                            },
                            {
                                property: 'FormattedID',
                                operator: 'contains',
                                value: value
                            }
                        ])
                    );
                } else if (prefixPlusNumbers.test(value) && this._isValidField(model, ['FormattedID'])) {
                    filters.push({
                        property: 'FormattedID',
                        operator: 'contains',
                        value: value
                    });
                }
            }, this);

            if (this._isValidField(this.model, ['Name'])) {
                filters.push({
                    property: 'Name',
                    operator: 'contains',
                    value: value
                });
            }

            if (this._isValidField(this.model, ['Description'])) {
                filters.push({
                    property: 'Description',
                    operator: 'contains',
                    value: value
                });
            }

            return Rally.data.wsapi.Filter.or(filters);
        }
    }
});
