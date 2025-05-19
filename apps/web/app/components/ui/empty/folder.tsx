export const FolderEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <img src="/assets/svg/empty-folder.svg" className="h-20 md:h-60" alt="" />
      <h3 className="text-16-medium text-heading md:text-18-medium">
        Drag and drop files here
      </h3>
      <p className="text-12 md:text-14">
        or click on the button <span className="text-heading">"New"</span>
      </p>
    </div>
  );
};

export const TrashEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center py-5">
      <img src="/assets/svg/empty-folder.svg" className="h-20 md:h-60" alt="" />
      <h3 className="text-16-medium text-heading md:text-18-medium">
        Trash is empty
      </h3>
      <p className="text-12 md:text-14">
        The items in the trash will be deleted permanently after 30 days.
      </p>
    </div>
  );
};

export const SuggestionEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center py-5">
      <img src="/assets/svg/empty-folder.svg" className="h-20 md:h-60" alt="" />
      <h3 className="text-16-medium text-heading md:text-18-medium">
        No suggestions
      </h3>
    </div>
  );
};
