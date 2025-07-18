-- CreateTable
CREATE TABLE "_SavedEvents" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_SavedEvents_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SavedEvents_B_index" ON "_SavedEvents"("B");

-- AddForeignKey
ALTER TABLE "_SavedEvents" ADD CONSTRAINT "_SavedEvents_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedEvents" ADD CONSTRAINT "_SavedEvents_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
