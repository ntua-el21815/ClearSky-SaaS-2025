import { gradeAPI } from '../api/index';      // gradeAPI = axios instance προς grade-orchestrator
<<<<<<< HEAD
<<<<<<< HEAD
import { userAPI  } from '../api/index';     // αν χρειαστεί (users / credits)
=======
import { userAPI  } from '../api/index';      // αν χρειαστεί (users / credits)
>>>>>>> origin/Harris
=======
import { userAPI  } from '../api/index';      // αν χρειαστεί (users / credits)
>>>>>>> origin/Harris

export async function fetchInstitutionStats() {
  const { data } = await userAPI.get('/institution/stats');
  return data;                         // { credits, users, activeCourses, institution }
}

export async function fetchInstitutionCourses() {
  const { data } = await gradeAPI.get('/institution/courses');
  return data;                         // [{ courseId, name, examPeriod, stats:{ total:[…] } }, …]
}

export async function fetchCourseStats(courseId) {
  const { data } = await gradeAPI.get(`/institution/courses/${courseId}/stats`);
  return data;                         // { total:[…], questions:{ Q1:[…], … } }
<<<<<<< HEAD
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/Harris
=======
}
>>>>>>> origin/Harris
