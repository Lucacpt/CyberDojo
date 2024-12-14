const CourseDAO = require("../dao/courseDAO");
const RewardsService = require("../../Premi/externalRewardsService");

class CourseService {
  static async getAllCoursesGuest() {
    return await CourseDAO.getAllCourses();
  }

  static async getAllCoursesUser(username) {
    const courses = await CourseDAO.getAllCourses();
    let enrolledCourses = [];

    if (username) {
      enrolledCourses = await CourseDAO.getEnrolledCourses(username);
    }

    return courses.map((course) => {
      const enrolledCourse = enrolledCourses.find(
        (enrolled) => enrolled.course_id === course._id
      );
      return {
        _id: course._id,
        name: course.name,
        description: course.description,
        difficulty: course.difficulty,
        course_image: course.course_image,
        isEnrolled: !!enrolledCourse,
        isCompleted: enrolledCourse ? enrolledCourse.isCompleted : false,
      };
    });
  }

  /*
  static async getAllCourses(username) {
    const courses = await CourseDAO.getAllCourses();
    let enrolledCourses = [];

    if (username) {
      enrolledCourses = await CourseDAO.getEnrolledCourses(username);
    }

    return await Promise.all(
      courses.map(async (course) => {
        let isEnrolled = false;
        let testExists = false;

        if (username) {
          isEnrolled = enrolledCourses.some(
            (enrolledCourse) => enrolledCourse.course_id === course._id
          );
          testExists = await RewardsService.getTestExistsForUserAndCourse(
            username,
            course._id
          );
        }

        return {
          id: course._id,
          title: course.name,
          icon: course.course_image,
          difficulty: course.difficulty,
          description: course.description,
          isEnrolled,
          test: testExists,
        };
      })
    );
  }
*/

  static async getLessonsByCourseName(courseName) {
    return await CourseDAO.getLessonsByCourseName(courseName);
  }

  static async enrollCourse(courseId, username) {
    return await CourseDAO.enrollCourse(courseId, username);
  }

  static async getProgressOfCourse(username, course_id) {
    const corsi_utente = await CourseDAO.getEnrolledCourses(username);
    const corso_utente = corsi_utente.find(
      (corsi_utente) => corsi_utente.course_id === course_id
    );

    const course = await CourseDAO.getCourseInfo(course_id);
    console.log("Ciao", course);
    const totalLessons = course.lessons.length;

    const testExists = await RewardsService.getTestExistsForUserAndCourse(
      username,
      course._id
    );

    const normalizedLessonReached = corso_utente.lesson_reached
      .trim()
      .toLowerCase();
    const lessonIndex = course.lessons.findIndex(
      (lesson) => lesson.name.trim().toLowerCase() === normalizedLessonReached
    );

    let progress = (lessonIndex / totalLessons) * 100;
    if (lessonIndex + 1 === totalLessons && testExists) {
      progress = 100;
    } else {
      if (lessonIndex == 0) {
        progress = 0;
      } else {
        progress = Math.ceil(progress);
      }
    }

    return progress;
  }
  static async getCourseById(courseId, username) {
    // Retrieve course data
    const course = await CourseDAO.getCourseInfo(parseInt(courseId, 10));
    if (!course) {
      throw new Error("Corso non trovato");
    }

    // Get user enrollment information
    const enrollment = await CourseDAO.getEnrollment(username, parseInt(courseId, 10));
    if (!enrollment) {
      throw new Error("Utente non iscritto a questo corso");
    }

    // Find the index of the last completed lesson
    const lessonIndex = course.lessons.findIndex(
      (lesson) => lesson.name === enrollment.lesson_reached
    );
    const lastCompletedIndex = lessonIndex >= 0 ? lessonIndex : -1;

    // Map the lessons adding the completion status
    const lessons = course.lessons.map((lesson, index) => ({
      id: lesson.id || lesson._id || index + 1,
      name: lesson.name,
      description: lesson.content,
      completed: index <= lastCompletedIndex,
    }));

    const progress = await CourseService.getProgressOfCourse(username, parseInt(courseId, 10));

    return {
      id: course._id,
      title: course.name,
      icon: course.course_image,
      description: course.description,
      lessons,
      progress,
    };
  }

  static async updateUserProgress(courseId, lessonId, username) {
    const course = await CourseDAO.getCourseInfo(parseInt(courseId , 10));
    console.log(courseId);
    if (!course) {
      throw new Error("Corso non trovato");
    }

    const lesson = course.lessons.find((lesson) => lesson.name === lessonId);
    if (!lesson) {
      throw new Error("Lezione non trovata");
    }

    await CourseDAO.updateUserProgress(courseId, lessonId, username);
  }

}

module.exports = CourseService;
