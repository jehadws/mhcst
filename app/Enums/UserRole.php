<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'Admin';
    case Manager = 'Manager';
    case ContentEditor = 'Content Editor';
    case Support = 'Support';
    case Teacher = 'Teacher';
    case Student = 'Student';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * @return list<string>
     */
    public static function cmsAccessRoles(): array
    {
        return [
            self::Admin->value,
            self::Manager->value,
            self::Teacher->value,
        ];
    }

    /**
     * @return list<string>
     */
    public static function cmsManageRoles(): array
    {
        return [
            self::Admin->value,
            self::Manager->value,
        ];
    }

    /**
     * @return list<string>
     */
    public static function cmsAdminRoles(): array
    {
        return [self::Admin->value];
    }

    /**
     * @return list<string>
     */
    public static function contentRoles(): array
    {
        return [
            self::Admin->value,
            self::Manager->value,
            self::ContentEditor->value,
        ];
    }

    /**
     * @return list<string>
     */
    public static function crmRoles(): array
    {
        return [
            self::Admin->value,
            self::Manager->value,
            self::Support->value,
        ];
    }

    /**
     * @return list<string>
     */
    public static function settingsRoles(): array
    {
        return [self::Admin->value];
    }

    /**
     * @return list<string>
     */
    public static function uploadRoles(): array
    {
        return array_values(array_unique([
            ...self::cmsAccessRoles(),
            ...self::contentRoles(),
        ]));
    }
}
