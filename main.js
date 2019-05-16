'use strict';
//todo:
//1. add clean slate

{

function withFile(filename, action) {
	$.get(chrome.runtime.getURL(filename), action);
}

function reverse(s) {
	return s.split("").reverse().join("");
}

function getText(_, e) {
	return $(e).text().trim();
}

function reverseHebrew(_, container) {
	$(container).html(reverse($(container).html()
				.replace(/&nbsp;/g, " ").split("<br>").reverse().join(" ")
				.replace(/([".%0-9/A-Za-z])+/g, reverse)
				.replace("(", "[").replace(")", "(").replace("[", ")")));
}

function reverseChildren(_, elem) {
	const items = $(elem).children();
	$(elem).append(items.get().reverse());
}

function prepareToParse() {
	$('script').detach();
	$('tr').each(reverseChildren);
// This is probably something that used to be necessary, but now doesn't seem.
//  $('td').each(reverseHebrew);

	
	$('table:eq(0)').detach();
	$('div:eq(0)').append($('font p').children());
	// This is probably something that used to be necessary, but now doesn't seem.
//	$('font').detach();
	$('div table:eq(0)').addClass('details');
	$('div table:eq(1)').addClass('summary');
	$('div table:eq(2)').addClass('credits');
	$('div table:gt(2)').addClass('exams');
	$('div table:gt(1)').addClass('grades');
	
	$('table.details tr:lt(2)').find('td:eq(1)').addClass('numeral');
	$("table.details tr td:nth-child(2)").addClass('details_content');
	
	$('table.summary tr:eq(1)').addClass('numeral');
	$('table.grades').each(function(i, table){
		$(table).find('tr:eq(0)').addClass('header1');
		$(table).find('tr:eq(1)').addClass('header2');
		$(table).find('tr:not(:last-child):gt(1)').addClass('exams');
		$(table).find('tr:last').addClass('total');
		
		$(table).find('tr.exams td:nth-child(1)').addClass('course_name');
		$(table).find('tr.exams td:nth-child(2)').addClass('points');
		$(table).find('tr.exams td:nth-child(3)').addClass('grade');
		
		$(table).find('tr.total td:nth-child(3)').addClass('suc_av');
		$(table).find('tr.total td:nth-child(2)').addClass('points');
	});
	
	$("table.grades").each(function(semester_id) { 
		const semester = $(this).find('.header1').text();
		$(this).find("tr").each(function() {
			$(this).attr('semester', semester);
			$(this).attr('semester_id', semester_id);
		});
	});
	return true;
}

function cleanToRow(c) {
	return ( '<tr>'
		+ '<td class="course_id">' + (c.course_id || "") + '</td>'
		+ '<td class="course_name">' + c.name + '</td>'
		+ '<td class="points">' + c.points + '</td>'
		+ '<td class="grade">' + c.grade + '</td>'
	+ '</tr>');
}

function examToRow(e) {
	return (
	'<tr class="exams ' + (e.semester_id % 2 ? 'info' : '') + '">'
		+ '<td class="semester_id" data-toggle="tooltip" title=\''+e.semester+'\'>' + e.semester_id + '</td>'
		+ '<td class="global">' + e.global_count + '</td>'
		+ '<td class="course_id">' + (e.course_id || "") + '</td>'
		+ '<td class="course_name">' + e.name + '</td>'
		+ '<td class="points">' + e.points + '</td>'
		+ '<td class="grade">' + e.grade + '</td>'
		+ '<td class="status">' + e.status + '</td>'
		+ '<td class="retaken">' + e.retaken + '</td>'
	+ '</tr>');
}

function totalToRow(t) {
	return ('<tr class="total">'
			+ '<td class="semester_id">' + t.semester_id + '</td>'
			+ '<td class="semester_name">' + t.semester + '</td>'
			+ '<td class="points">' + t.points + '</td>'
			+ '<td class="average">' + t.average + '</td>'
			+ '<td class="success">' + t.success + '</td>'
		+ '</tr>');
}


function examrowToExam(global_count) {
	const semester_id = $(this).attr('semester_id');
	const semester = $(this).attr('semester');
	
	const id_name = $(this).find('.course_name').text();
	const [course_id] = id_name.match(/[0-9]{6}/) || [''];
	const name = id_name.replace(/\s*[0-9]{6}\s*/, "");
	
	const stat_grade = $(this).find('.grade').text();
	const status = stat_grade.replace(/[0-9*]+/, '').replace(/.*פטור.*/, 'פטור');
	const grade = stat_grade.replace(/[^0-9]+/, '').trim();
	const retaken = stat_grade.includes('*') ? 'כן' : '';
	
	const points = $(this).find('.points').text();
	return {global_count,semester_id, semester,
			course_id, status, grade, points, name, retaken};
}


function totalrowToTotal() {
	const semester_id = $(this).attr('semester_id');
	const semester = $(this).attr('semester');
	const suc_av = $(this).find('.suc_av').text().trim();
	const [_1, success='', _2, average=''] = suc_av.replace(/[א-ת]+/,'').split(/\s+/);
	const points = $(this).find('.points').text();
	return {semester_id, semester, points, average, success};
}

function extractData() {
	const [date, id, name, track, degree] = $("table.details tr td.details_content").map(getText);
	const [total_average, total_success, total_points] = $('table.summary tr.numeral td').map(getText);	
	return {
		exams: $("tr.exams").map(examrowToExam),
		totals: $("tr.total").map(totalrowToTotal),
		personal: { date: new Date(Date.parse(date)).toLocaleDateString('en-GB'),
					id, name, track, degree },
		summary: {total_points, total_success, total_average}
	};
}

function getCleanGradesFromExams(exams) {
	var clean = []
	var dirty_exams = exams.get()
	var found = 0;
	for(var i = 0; i < dirty_exams.length; i++) {
		for(var j = 0; j < clean.length; j++) {
			if(clean[j].course_id == dirty_exams[i].course_id && dirty_exams[i].grade != '') {
				clean[j] = dirty_exams[i];
				found = 1;
			}
		}
		if(!found && dirty_exams[i].grade != '')
			clean.push(dirty_exams[i]);
		found = 0;
	}
	var rclean = clean.reverse();
	return rclean;
}


function rearrangeDocument(exams, totals, details, summary) {
	const original = $('body > div').html();
	console.log(original);
	withFile("ug.html", function(data) {
		$('html').html(data); 
		
		
		var clean = getCleanGradesFromExams(exams);
		for (const c of clean) 
			$('#clean_grades_body').prepend(cleanToRow(c));
		
		var rexams = exams.get().reverse()
		for (const e of rexams)		
			$('#unified_body').prepend(examToRow(e));
		
		for (const t of totals)
			$('#summaries_body').append(totalToRow(t));
		
		for (const x of Object.getOwnPropertyNames(summary))
			$('#'+x).text(summary[x]);
		
		for (const x of Object.getOwnPropertyNames(details))
			$('#'+x).text(details[x]);
		
		$('#original').html(original);
	});
}

function isEligible() {
	const nonEligible = $('td B font').text().includes('הז תוריש תלבקל יאכז ךניא');
	if (nonEligible) {
		withFile("nonEligible.html", function(data) {
			$('html').html(data); 
			$('h1').text('אין לך זכאות לקבלת שירות זה');
			$('p').text('ככל הנראה סגרת את התואר. מזל טוב!');
		});
		return false;
	}	
	return true;
}

function run() {
	if (isEligible()) {
		prepareToParse();
		const {exams, totals, personal, summary} = extractData();
		rearrangeDocument(exams, totals, personal, summary);
	}
}

function setupLogin() {
	$('font :eq(0)').text('גיליון ציונים - מסך הזדהות לסטודנט')
	withFile("form.html", function(data) {
		$('form').html(data); 
		$('form').attr('role', 'form');
		$('#userlabel').text('מספר סטודנט');
		$('#passlabel').text('ססמא');
		$('#submitbutton').text('כניסה');
		$('#resetbutton').text('יציאה');
	});
}

if (window.location.pathname.startsWith('/cics/wmn/wmngrad')) {
	if (document.title !== 'Grades') {
		document.title = 'Grades';
		setupLogin();
	} else {
		run();
	}
}

}
