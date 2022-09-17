export class Timeclock {
  static isClockedIn = false;
  static taskType = null;
  static clockInTime = null;
  static clockOutTime = null;

  clockIn = ({ taskName }) => {
    if (isClockedIn) {
      return {
        success: false,
        message: "Already clocked-in",
      };
    } else {
      isClockedIn = true;
    }
  };

  clockOut = () => {
    if (!isClockedIn) {
      return { success: false, message: "Not clocked-in" };
    } else {
      isClockedIn = false;
    }
  };

  switchTask = (taskName) => {
    if (!isClockedIn) {
      return {
        success: false,
        message: "Not clocked-in",
      };
    } else if (taskName) {
    }
  };
}
