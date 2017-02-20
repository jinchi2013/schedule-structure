var scheduleModule = (function() {
	function categoryEventsLevel ( scheduledEventsArray ) {
		if( scheduledEventsArray.length === 0 ) {
			return false;
		}

		if( scheduledEventsArray.length === 1 ) {
			return {
				"1": scheduledEventsArray
			}
		}

		// add labelname for each events in the given Array
		scheduledEventsArray.forEach(function(event, index){
			event.labelName = "event" + index;
		});

		
		var eventLevelCategory = {
			levelArray : [1],
			"1": []
		};

		function iterateEventFn(startEvent, otherEvents, level) {

			var conflictsInLevel = false;

			if( typeof eventLevelCategory[level] === 'undefined') {
				eventLevelCategory[level] = [];
				eventLevelCategory.levelArray.push(level);
			}
			startEvent['AtLevel'] = level;
			startEvent['IndexNum'] = eventLevelCategory[level].length;
			eventLevelCategory[level].push(startEvent);
			
			while (otherEvents.length > 0) {
				var newLevelIndex = 1;
				var copyEventLevelCategory = Object.assign({}, eventLevelCategory);
				var levelArray = copyEventLevelCategory.levelArray.slice(0);
				var newStartEvent = otherEvents.shift();
				newStartEvent['ConflictWith'] = '';
				newStartEvent['conflictsEventArray'] = [];

				// loop through each level
				levelArray.forEach(function(LevelInArray){

					// if new event has no conflict with events in previous LevelArray
					if( LevelInArray > 1 && !newStartEvent['hasConflictIn' + (LevelInArray-1)]) {
						return false;
					}

					// loop through each event in one level
					copyEventLevelCategory[LevelInArray].forEach(function(eventInLevel){

						// set the condition to decide whether two events has conflict
						if( (eventInLevel.start <= newStartEvent.start && newStartEvent.start < eventInLevel.end) || (eventInLevel.start < newStartEvent.end && newStartEvent.end <= eventInLevel.end) || (newStartEvent.start <= eventInLevel.start && newStartEvent.end >= eventInLevel.end) ) {

							// found out newEvent has conflict with events in current level
							// set var conflictsInLevel = false; to true,
							// Add event labelName to a string in newStartEvent,
							// Add conflict event into conflictsEventArray in newStartEvent.
							conflictsInLevel = true;
							newStartEvent['ConflictWith'] += eventInLevel.labelName + '|';
							newStartEvent['conflictsEventArray'].push(Object.assign({}, eventInLevel));
							
							// add 1 to newLevelIndex, 
							// add attribute to newEvent => hasConflictIn1 : true
							if ( typeof newStartEvent['hasConflictIn' + LevelInArray] === 'undefined' ) {
								// found out this is the first time this conflict found out
								newStartEvent['hasConflictIn' + LevelInArray] = true;
								newLevelIndex++;
							}
							
						}
					});

					if (!conflictsInLevel) {
						// found out there is no conflicts in this level, then just add newEvent to current levelInArray
						iterateEventFn(newStartEvent, otherEvents, LevelInArray);
						return false;
					}
				});

				if( conflictsInLevel ) {
					conflictsInLevel = false;
					iterateEventFn(newStartEvent, otherEvents, newLevelIndex);	
				}
			}
		}

		var startEvents = scheduledEventsArray.shift();
		var otherEvents = scheduledEventsArray;
		iterateEventFn(startEvents, otherEvents, 1);

		return eventLevelCategory;
	}

	function addHeightTopForScheduleObjectForDOM( scheduleObjectForDOM ) {
		var levelArray = scheduleObjectForDOM.levelArray;

		levelArray.forEach(function(levelNum){
			scheduleObjectForDOM[levelNum].forEach(function(event){
				event.height = event.end - event.start;
				event.topPosition = event.start;
			});
		});
		
		return scheduleObjectForDOM;
	}

	function prepareScheduleObjectForDOM (scheduledEventsArray) {
		var scheduleObjectForDOM = categoryEventsLevel(scheduledEventsArray);

		// first add event labelName to raw given scheduledEventsArray
		var scheduledEventsArray_addLabel = scheduledEventsArray.map(function(event, index){
			event.labelName = 'event' + index;
			return event;
		});

		if( typeof scheduleObjectForDOM.levelArray !== 'undefined' ) {
			var reverseLevelArray = scheduleObjectForDOM.levelArray.reverse();

			reverseLevelArray.forEach(function(levelNum){
				scheduleObjectForDOM[levelNum].forEach(function(event){

					if(typeof event.leftPosition === 'undefined' ) {
						event.width = 600/levelNum;
						event.leftPosition = 600 - event.width;
					}

					// set the width and left position for its conflict events
					if( typeof event.conflictsEventArray !== 'undefined' && event.conflictsEventArray.length > 0) {
						event.conflictsEventArray.forEach(function(conflictEvent){
							conflictEvent.width = event.width;
							conflictEvent.leftPosition = conflictEvent.width * (conflictEvent.AtLevel - 1);

							// substitude the event in lower level
							var copyOfConflictEvent = Object.assign({}, conflictEvent);

							if(typeof scheduleObjectForDOM[copyOfConflictEvent.AtLevel][copyOfConflictEvent.IndexNum].width === 'undefined') {
								scheduleObjectForDOM[copyOfConflictEvent.AtLevel].splice(copyOfConflictEvent.IndexNum, 1, copyOfConflictEvent);
							}
						});
					}
				});
			});
		}

		// add height and top position value for object
		scheduleObjectForDOM = addHeightTopForScheduleObjectForDOM( scheduleObjectForDOM );

		return scheduleObjectForDOM;

	}

	return {
		prepareScheduleObjectForDOM : prepareScheduleObjectForDOM
	}

})();