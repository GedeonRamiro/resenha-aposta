---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

---
description: Padrão de arquitetura NestJS usado neste projeto
globs: src/**/*.ts
alwaysApply: true
---

# NestJS Architecture Rules

Este projeto utiliza arquitetura padrão NestJS com separação clara entre Controller, Service, DTO, Entity e Interfaces.

## Estrutura obrigatória dos módulos

Cada módulo deve seguir a estrutura:

src/
 └── module-name/
      ├── dtos/
      │    ├── CreateModule.dto.ts
      │    ├── UpdateModule.dto.ts
      │    └── ReturnModule.dto.ts
      ├── entities/
      │    └── module.entity.ts
      ├── interface/
      │    └── ReturnModulePagination.ts
      ├── module.controller.ts
      ├── module.service.ts
      └── module.module.ts

---

# Controllers

Controllers devem:

- Receber requisições HTTP
- Validar DTOs
- Chamar Services
- Retornar DTOs de resposta

Controllers NÃO devem conter regra de negócio.

Exemplo correto:

```typescript
@Controller('camera')
export class CameraController {

 constructor(private readonly cameraService: CameraService) {}

 @Post()
 async createCamera(@Body() dto: CreateCameraDto){
   return this.cameraService.createCamera(dto)
 }

}