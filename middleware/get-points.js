const getPoints = (results, sprint, halfPoints) => {

  const attendance = results.attendance;

  let total;
  if (attendance == "Attended" || attendance == "attended") {
    const sprintPoints = GetSprintPoints(results.sprint, sprint);
    const racePoints = GetRacePoints(results.race, halfPoints);
    const flapPoints = GetflapPoints(results.race, results.fastestLap);

    total = sprintPoints + racePoints + flapPoints;
  } else {
    const sprintPoints = 0;
    const racePoints = 0;
    const flapPoints = 0;

    total = sprintPoints + racePoints + flapPoints;
  }

  return total;
};

const GetSprintPoints = (position, sprint) => {
  let points;
  if(sprint == true){
    switch(position) {
      case 1:
        points = 8
        break;
      case 2:
        points = 7
        break;
      case 3:
        points = 6
        break;
      case 4:
        points = 5
        break;
      case 5:
        points = 4
        break;
      case 6:
        points = 3
        break;
      case 7:
        points = 2
        break;
      case 8:
        points = 1
        break;
      default:
        points = 0
    }
  } else {
    points = 0;
  }

    return points;
}

const GetRacePoints = (position, halfPoints) => {

  let points;
    if (halfPoints == false ) {
      switch(position) {
        case 1:
          points = 25
          break;
        case 2:
          points = 18
          break;
        case 3:
          points = 15
          break;
        case 4:
          points = 12
          break;
        case 5:
          points = 10
          break;
        case 6:
          points = 8
          break;
        case 7:
          points = 6
          break;
        case 8:
          points = 4
          break;
        case 9:
          points = 2
          break;
        case 10:
          points = 1
          break;
        default:
          points = 0
      }
    } else {
      switch(position) {
        case 1:
          points = 12.5
          break;
        case 2:
          points = 9
          break;
        case 3:
          points = 7.5
          break;
        case 4:
          points = 6
          break;
        case 5:
          points = 5
          break;
        case 6:
          points = 4
          break;
        case 7:
          points = 3
          break;
        case 8:
          points = 2
          break;
        case 9:
          points = 1
          break;
        case 10:
          points = 0.5
          break;
        default:
          points = 0
      }
    }

  return points;
}

const GetflapPoints = (position, flap) => {

  let points;
  if ( flap == true & position > 0 & position <= 10 ) {
    points = 1;
  } else {
    points = 0;
  }

  return points;
}

module.exports = getPoints;