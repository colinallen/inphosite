/* Functions for use with by the entity admin lists.
 *
 * With the exception of the birthday and deathday attributes for Thinkers, 
 * the attributes start with the following tags:
 * "$attr_field" span
 *   "current_$attr" span
 *
 * The edit function changes the HTML to the following:
 * "$attr_field" span
 *   "$attr_text" input box / dropdown menu
 *   "old_$attr" input box
 *
 * The reset function reverts it to the original tags.
 */


// When the text of an editable attribute (or the pencil icon next to it) is 
// clicked, two changes occur:
// 1.) The edit icon is hidden.
// 2.) The field displaying the property is changed from a static text field 
//     to a text input box or dropdown menu.
function edit(attr, url) {
  if (attr == "sep_dir" || attr == "searchstring" || attr == "wiki" || 
      attr == "birth" || attr == "death" || attr == "URL" || 
      attr == "last_accessed" || attr == "language" || attr == "ISSN")
    edit_textbox(attr, url);
  else if (attr == "openAccess" || attr == "active" || attr == "student")
    edit_dropdown(attr, url);
}

function edit_textbox(attr, url) {
  // set up strings for use later & hide edit icon
  var current_attr = "current_" + attr;
  var attr_field = attr + "_field";
  var attr_edit = attr + "_edit";

  document.getElementById(attr_edit).style.visibility = 'hidden';

  // get current value of attr and change the attr_field to a text input box 
  // (with a hidden textbox containing the original value); special case for 
  // birthdays and deathdays, which require three textboxes & a dropdown
  if (attr == "birth" || attr == "death") {
    var attr_year = attr + "_year";
    var attr_month = attr + "_month";
    var attr_day = attr + "_day";
    var attr_era = attr + "_era";
    var old_attr = "old_" + attr;
    document.getElementById(current_attr).style.visibility = 'hidden';
    document.getElementById(current_attr).id = "old_" + attr;
    document.getElementById(attr_year).style.visibility = 'visible';
    document.getElementById(attr_month).style.visibility = 'visible';
    document.getElementById(attr_day).style.visibility = 'visible';
  }
  else {
    var attr_value = document.getElementById(current_attr).innerHTML.trim();
    var textbox = '<input type="text" id="' + attr + '_text" value="' + attr_value + '" onKeyDown="Javascript: if (event.keyCode == 13) submit(\'' + attr + '\', \'' + url + '\')"> <input id="old_' + attr + '" style="visibility: hidden" value="' + attr_value + '">';
    document.getElementById(attr_field).innerHTML = textbox;
  }

  if (attr == "URL")
    document.getElementById("test_URL").style.visibility = 'hidden';
}

function edit_dropdown(attr, url) {
  // set up strings for use later & hide edit icon
  var current_attr = "current_" + attr;
  var attr_field = attr + "_field";
  var attr_edit = attr + "_edit";
  if (attr == "openAccess") {
    var negative = "Closed";
    var positive = "Open";
  }
  else if (attr == "active") {
    var negative = "Inactive";
    var positive = "Active";
  }
  else if (attr == "student") {
    var negative = "Student";
    var positive = "Nonstudent";
  }

  document.getElementById(attr_edit).style.visibility = 'hidden';

  // get current value of attr and change the attr_field to a dropdown menu 
  // (with a hidden textbox containing the original value)
  var attr_value = document.getElementById(current_attr).innerHTML.trim();
  if (attr_value == negative)
    var dropdown = '<select id="' + attr + '_text" onclick="submit(\'' + attr + '\', \'' + url + '\')"> <option selected="selected" value="0"> ' + negative + ' </option> <option value="1"> ' + positive + ' </option> </select> <input id="old_' + attr + '" style="visibility: hidden" value="' + attr_value + '">';
  else if (attr_value == positive)
    var dropdown = '<select id="' + attr + '_text" onclick="submit(\'' + attr + '\', \'' + url + '\')"> <option value="0"> ' + negative + ' </option> <option selected="selected" value="1"> ' + positive + ' </option> </select> <input id="old_' + attr + '" style="visibility: hidden" value="' + attr_value + '">';

  document.getElementById(attr_field).innerHTML = dropdown;
}


// If a mutable attribute has been edited, three changes should happen.  The 
// submit() function takes care of the first.  The reset() function takes care 
// of the other two.
//
// The submit() function is simply responsible for getting the value of the 
// attribute's text box and sending a PUT to the server to update that value.
// If it is successful, the reset() function is called to handle the cosmetic 
// changes.
//
function submit(attr, url) {
  // get value of attr
  // dates must PUT three values: the day, month, and year
  if (attr == "birth" || attr == "death") {
    var attr_year = attr + "_year";
    var attr_month = attr + "_month";
    var attr_day = attr + "_day";
    var year = document.getElementById(attr_year).value;
    var month = document.getElementById(attr_month).value;
    var day = document.getElementById(attr_day).value;
    var value = attr_year + "=" + year + "\n" + 
                attr_month + "=" + month + "\n" + 
                attr_day + "=" + day
  }
  // input sanitisation for URLs
  else if (attr == "URL") {
      var value = document.getElementById("URL_text").value;
      if (value.substring(0, 7) != "http://")
        value = "http://" + value;
      var value = attr + "=" + value;
  }
  else {
    var attr_text = attr + "_text";
    var value = attr + "=" + document.getElementById(attr_text).value;
  }

  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        reset(attr, url, xhr.status)
    }
  }
  xhr.open('PUT', url, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(value);
}


// The reset function does the following:
// 1.) The text input box should go back to a static field displaying either 
//     the new property (on success) or the old property (on failure).
// 2.) The edit icon should re-appear.
//
function reset(attr, url, response) {
  // set up strings for use later
  var attr_text = attr + "_text";
  var old_attr = "old_" + attr;
  var attr_field = attr + "_field";
  var attr_edit = attr + "_edit";
  
  if (response == 200) {
    if (attr == "birth" || attr == "death") {
      var attr_year = attr + "_year";
      var attr_month = attr + "_month";
      var attr_day = attr + "_day";
      var year = document.getElementById(attr_year).value;
      var month = document.getElementById(attr_month).value;
      var day = document.getElementById(attr_day).value;

      var era_pattern = new RegExp("(BC|AD|BCE|CE)");
      var era = era_pattern.exec(year);
      if (era == null) {
        var attr_value = year + "-" + month + "-" + day;
      }
      else {
        var year_pattern = new RegExp("[0-9]+");
        var year = year_pattern.exec(year);
        var attr_value = year + "-" + month + "-" + day + " " + era;
      }
    }
    else
      var attr_value = document.getElementById(attr_text).value;
  }

  // PUT was not successful:
  else
    var attr_value = document.getElementById(old_attr).value;

  if (attr == "openAccess" && attr_value == 0)
    var attr_value = "Closed";
  else if (attr == "openAccess" && attr_value == 1)
    var attr_value = "Open";
  else if (attr == "active" && attr_value == 0)
    var attr_value = "Inactive";
  else if (attr == "active" && attr_value == 1)
    var attr_value = "Active";
  else if (attr == "student" && attr_value == 0)
    var attr_value = "Student";
  else if (attr == "student" && attr_value == 1)
    var attr_value = "Nonstudent";

  var input_field = '<span id="current_' + attr + '" onclick="edit(\'' + attr + '\', \'' + url + '\')"> ' + attr_value + ' </span>';
  document.getElementById(attr_field).innerHTML = input_field;
  document.getElementById(attr_edit).style.visibility = 'visible';

  if (attr == "URL" && response == 200) {
    document.getElementById("test_URL").setAttribute('href', attr_value);
    document.getElementById("test_URL").style.visibility = 'visible';
  }
}