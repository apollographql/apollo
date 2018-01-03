# File uploads meeting

### Attendees

- Jayden Seric
- Adam Yee
- Thea Lamkin
- Sashko Stubailo
- Pierre Carrier
- Evans Hauser

### Action items

- Merge upload support into the HTTP Link implementation, to reduce code duplication (Jayden and Evans).
  - Make progress on batch link as well.
- Add apollo upload server to Apollo Server docs (Sashko).
- For Engine, don't process multipart requests, but pass them through as-is. The file upload system will only use those requests when there is a file to upload so this won't affect most usage.

Other todo items

- File upload client and server implementations need tests. The client tests are difficult because browser APIs such as `File` and `FileList` are not available in a Node.js test environment. It's been tested in several production apps so we know it works, but we probably want automated tests before shipping upload support in `apollo-link-http`.
- We want the spec to be on the level of the Apollo Tracing spec in terms of specificity, this will help work out more of the details and ties in with the testing story.
- The batching spec in the server docs is insufficient and hard to find. This needs to be upgraded.
- We might want a page somewhere that lists all Apollo specs/extensions for GraphQL.
