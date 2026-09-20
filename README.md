# StudySphere EdTech Platform
Demo - https://studysphere-edtech.vercel.app/

**Mobile-responsive edtech website** built with **MERN Stack**, supporting students, instructors, and admins.

### Features -
1. **Interactive Homepage**
   - Mobile-responsive Navbar
   - Code animation effects
   - Tab switching between explore more section
   - Review and Rating Slider for student-purchased courses
   - About and Contact Us Pages also having Contact Us form
2. **User Profile**
   - Upload and update profile picture
   - Edit About Me section
   - Password Reset - Works locally, but Vercel and Netlify don’t support direct access to routes other than the homepage (Direct access or Reload not supported)
   - Delete account feature:
     - Set up with a **cron job** that checks every day at 1 AM.
     - If the user doesn’t log in for 3 days, the account is deleted.
     - Logging in before 3 days cancels the scheduled deletion.
3. **Admin Panel**
   - Create Admin account via backend (Postman)
   - Admin login access
   - Create **Course Categories** for the Catalog Navbar(only shown if at least one published course exists for that Category)
4. **Instructor Features**
   - Instructor sign up with email OTP and login
   - Create courses under available categories
   - Add **Sections** and **Subsections (Video Lectures)** inside courses
   - Publish courses (only published courses appear in View Courses page section)
   - Edit or delete existing courses
5. **Student Features**
   - Student sign up with email OTP and login
   - Add multiple courses to cart and Buy or use Buy Now from the View Courses page.
   - Purchase courses using test Razorpay API
   - Access course content with:
     - Accordion-based course section and subsection view
     - Ability to mark videos as completed (highlights in the accordion)
     - After completing a video, rewatch it or use Previous/Next to navigate within the same section, across subsections, or to the first/last videos of other sections.
6. **Course Interaction**
   - Students can leave **reviews and star ratings** for purchased courses
   - Public display of average ratings (visible to all on Homepage)
7. **View Courses Page**
   - Courses sliders (pause on hover)
   - Show course star ratings and enrolled students count
   - Display frequently bought courses
   - Option to Add to Cart and Buy directly
8. **Dashboards**
   - **Student Dashboard**:
     - View all enrolled/purchased courses
     - Track progress with completed video counts and total course duration
   - **Instructor Dashboard**:
     - Visual **Pie Chart** stats showing student count per course
     - Display total earnings and per-course earnings using charts
     - Manage (edit/create) all their courses from one place
9. **About & Contact Pages**
   - Dedicated About page describing the platform
   - Contact Us page with a functional contact form for user inquiries
