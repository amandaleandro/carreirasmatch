"use client";

import { useTransition } from "react";
import { addUserCourse, deleteUserCourse } from "@/app/settings/actions";
import { getCoursesForArea } from "@/lib/course-catalog";

type UserCourseItem = {
  id: string;
  title: string;
  provider: string;
  url: string;
  status: string;
};

export function CourseListForm({
  courses,
  professionalArea,
}: {
  courses: UserCourseItem[];
  professionalArea: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const suggestions = getCoursesForArea(professionalArea);

  function handleAdd(formData: FormData) {
    startTransition(() => {
      addUserCourse(formData);
    });
  }

  function handleDelete(courseId: string) {
    startTransition(() => {
      deleteUserCourse(courseId);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-2">Seus cursos e certificados</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum curso cadastrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {courses.map((course) => (
              <li
                key={course.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words">{course.title}</p>
                  {course.provider && (
                    <p className="text-neutral-500">{course.provider}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(course.id)}
                  className="text-red-500 hover:underline disabled:opacity-50 self-start sm:self-auto shrink-0"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={handleAdd} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do curso</label>
          <input
            type="text"
            name="title"
            required
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Instituição</label>
            <input
              type="text"
              name="provider"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              defaultValue="completed"
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-3 py-2 text-sm"
            >
              <option value="completed">Concluído</option>
              <option value="in_progress">Em andamento</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Link do certificado (opcional)</label>
          <input
            type="url"
            name="url"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 text-white font-medium px-5 py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Adicionar curso
        </button>
      </form>

      {suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Cursos recomendados para sua área</h3>
          <ul className="space-y-2">
            {suggestions.map((entry) => (
              <li
                key={`${entry.title}-${entry.provider}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium break-words">{entry.title}</p>
                  <p className="text-neutral-500">
                    {entry.provider} {entry.free ? "· Gratuito" : "· Pago"}
                  </p>
                </div>
                <form
                  action={(formData) => {
                    formData.set("title", entry.title);
                    formData.set("provider", entry.provider);
                    handleAdd(formData);
                  }}
                  className="self-start sm:self-auto shrink-0"
                >
                  <button
                    type="submit"
                    disabled={isPending}
                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    Já fiz esse
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
