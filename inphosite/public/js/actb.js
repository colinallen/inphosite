// initialize namespaces
var inpho = inpho || {};
inpho.actb = inpho.actb || {};



// The following is a modification of a script by Charles Lawrence (@geuis)
// Have modified to genericize it more. Twitter Bootstrap Typeahead doesn't
// support remote data querying. This is an expected feature in the future. In
// the meantime, others have submitted patches to the core bootstrap component
// that allow it.

// The following will allow remote autocompletes *without* modifying any
// officially released core code.  If others find ways to improve this, please
// share.
inpho.actb.init = function(elt, api_call) {
  if (!api_call) {
    var api_call = "/entity.json";
  }

  var url = inpho.util.url(api_call);

  // solution from pull request:
  // https://github.com/twitter/bootstrap/pull/3682
  var labels, mapped;
  $(elt).typeahead({
    sorter: function(items) { return items; },
    source: function(query, process) {
      $.getJSON(url, {q: query}, function(data) { 
        labels = [];
        mapped = {};
        $.each(data.responseData.results, function(i, item) {
          mapped[item.label] = item;
          labels.push(item.label);
        });
        
        process(labels);
        this.$menu.find('.active').removeClass('active');
      }); },
    highlighter: function(item) {
      var link = '<a href="' + mapped[item].url + '">';
      var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
      var formatted = item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                            return '<strong>' + match + '</strong>'
                                  });
      return  link + formatted + '</a>';
    },
    updater: function(item) {
      if (!item) return this.$element.val();
      else window.location = inpho.util.url(mapped[item].url);
      return item;
      }
  });
} // initialize_typeahead

