scheduleModule = (function() {
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
			eventLevelCategory[level].push(startEvent);
			
			while (otherEvents.length > 0) {
				var newLevelIndex = 1;
				var copyEventLevelCategory = Object.assign({}, eventLevelCategory);
				var levelArray = copyEventLevelCategory.levelArray.slice(0);
				var newStartEvent = otherEvents.shift();
				newStartEvent['ConflictWith'] = '';

				// loop through each level
				levelArray.forEach(function(LevelInArray){

					// if new event has no conflict with events in previous LevelArray
					if( LevelInArray > 1 && !newStartEvent['hasConflictIn' + (LevelInArray-1)]) {
						return false;
					}

					// loop through each event in one level
					copyEventLevelCategory[LevelInArray].forEach(function(eventInLevel){

						if( (eventInLevel.start <= newStartEvent.start && newStartEvent.start < eventInLevel.end) || (eventInLevel.start < newStartEvent.end && newStartEvent.end <= eventInLevel.end) ) {

							// found out newEvent has conflict with events in current level
							conflictsInLevel = true;
							newStartEvent['ConflictWith'] += eventInLevel.labelName + '|';
							
							// add 1 to newLevelIndex, 
							// push newLevelIndex into copyEventLevelCategory.levelArray,
							// set var conflictsInCurrentLevel = false; to true, 
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

	function prepareScheduleStructure( scheduledEventsArray ) {
		var eventLevelCategory = categoryEventsLevel(scheduledEventsArray);
		var categoryLevelsArray = eventLevelCategory.levelArray.slice(0);
		var totalNumberOfEvent = 0;

		categoryLevelsArray.forEach(function(LevelInArray){
			totalNumberOfEvent += eventLevelCategory[LevelInArray].length;

			eventLevelCategory[LevelInArray].forEach(function(event){
				event.width = 600/LevelInArray;
				event.height = event.end - event.start;
				event.topPosition = event.start;
			});
		});

		eventLevelCategory.totalNumberOfEvent = totalNumberOfEvent;
		return eventLevelCategory;
	}

	return {
		prepareScheduleStructure : prepareScheduleStructure
	}

})();


















